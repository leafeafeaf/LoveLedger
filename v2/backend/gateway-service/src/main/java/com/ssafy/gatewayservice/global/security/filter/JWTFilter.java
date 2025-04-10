package com.ssafy.gatewayservice.global.security.filter;

import com.ssafy.gatewayservice.global.security.dto.request.CustomOAuth2User;
import com.ssafy.gatewayservice.global.security.dto.request.UserDto;
import com.ssafy.gatewayservice.global.security.util.JWTUtil;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class JWTFilter implements WebFilter {

    private final JWTUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String accessToken = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
//        log.info("accessToken = {}", accessToken);

        if (accessToken == null) { // 토큰이 없으면 필터 통과 (인증 X)
            return chain.filter(exchange);
        }

        try {
            jwtUtil.isExpired(accessToken);

            if (!"access".equals(jwtUtil.getCategory(accessToken))) {
                return unauthorized(exchange, "Invalid access token category");
            }

            String username = jwtUtil.getUsername(accessToken);
            Long userId = jwtUtil.getUserId(accessToken);
            Long libraryId = jwtUtil.getLibraryId(accessToken);

            log.info("JWT 인증 성공 - userId: {}, username: {}, libraryId: {}", userId, username,
                libraryId);

            UserDto userDto = UserDto.builder()
                .username(username)
                .userId(userId)
                .libraryId(libraryId)
                .build();

            CustomOAuth2User customOAuth2User = new CustomOAuth2User(userDto);

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                customOAuth2User,
                null,
                null
            );

            // 헤더에 사용자 정보 추가
            ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", userId.toString())
                .header("X-Library-Id", libraryId.toString())
                .header("X-Username", username)
                .build();

            ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();

            return chain.filter(mutatedExchange)
                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));

        } catch (ExpiredJwtException e) {
            return unauthorized(exchange, "Token expired");
        } catch (Exception e) {
            log.warn("JWT 오류: {}", e.getMessage());
            return unauthorized(exchange, "Invalid token");
        }
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        log.warn("⛔ 인증 실패: {}", message);
        var response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }
}
