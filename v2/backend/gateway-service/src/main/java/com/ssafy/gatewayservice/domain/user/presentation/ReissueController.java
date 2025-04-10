package com.ssafy.gatewayservice.domain.user.presentation;

import com.ssafy.gatewayservice.global.security.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/reissue")
public class ReissueController {

    private final JWTUtil jwtUtil;
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    private static final String REFRESH_TOKEN_KEY_PREFIX = "token";

    @PostMapping
    public Mono<Void> reissue(ServerWebExchange exchange) {
        String refreshToken = extractRefreshTokenFromCookies(exchange);

        if (refreshToken == null) {
            return writeUnauthorized(exchange, "No refresh token found");
        }

        if (jwtUtil.isExpired(refreshToken)) {
            return writeUnauthorized(exchange, "Refresh token expired");
        }

        if (!"refresh".equals(jwtUtil.getCategory(refreshToken))) {
            return writeUnauthorized(exchange, "Invalid token category");
        }

        Long userId = jwtUtil.getUserId(refreshToken);
        Long libraryId = jwtUtil.getLibraryId(refreshToken);
        String username = jwtUtil.getUsername(refreshToken);
        String redisKey = REFRESH_TOKEN_KEY_PREFIX + userId;

        Mono<String> storedTokenMono = redisTemplate.opsForValue().get(redisKey);

        return storedTokenMono
            .flatMap(stored -> {
                if (stored == null) {
                    return writeUnauthorized(exchange, "Refresh token not found in Redis");
                }

                if (!refreshToken.equals(stored)) {
                    return writeUnauthorized(exchange, "Refresh token does not match stored value");
                }

                String newAccess = jwtUtil.createJwt(userId, libraryId, "access", username,
                    1_800_000L);
                String newRefresh = jwtUtil.createJwt(userId, libraryId, "refresh", username,
                    86_400_000L);

                return redisTemplate.opsForValue().set(redisKey, newRefresh)
                    .flatMap(saved -> {
                        if (!saved) {
                            return writeUnauthorized(exchange,
                                "Failed to save refresh token to Redis");
                        }

                        var response = exchange.getResponse();
                        response.getHeaders().add(HttpHeaders.AUTHORIZATION, newAccess);

                        ResponseCookie cookie = ResponseCookie.from("refresh", newRefresh)
                            .httpOnly(true)
                            .secure(true)
                            .path("/")
                            .maxAge(86_400)
                            .sameSite("Strict")
                            .build();

                        response.addCookie(cookie);
                        response.setStatusCode(HttpStatus.OK);

                        return response.setComplete(); // ✅ 여기는 Mono<Void>
                    });
            });
    }

    private String extractRefreshTokenFromCookies(ServerWebExchange exchange) {
        return exchange.getRequest().getCookies().getFirst("refresh") != null
            ? exchange.getRequest().getCookies().getFirst("refresh").getValue()
            : null;
    }

    private Mono<Void> writeUnauthorized(ServerWebExchange exchange, String reason) {
        log.warn("reissue 실패: {}", reason);
        var response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }
}
