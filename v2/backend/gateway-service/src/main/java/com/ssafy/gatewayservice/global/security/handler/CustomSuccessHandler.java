package com.ssafy.gatewayservice.global.security.handler;


import com.ssafy.gatewayservice.global.security.dto.request.CustomOAuth2User;
import com.ssafy.gatewayservice.global.security.util.JWTUtil;
import com.ssafy.gatewayservice.global.webclient.util.OpenWebClientUtil;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomSuccessHandler implements ServerAuthenticationSuccessHandler {

    private final JWTUtil jwtUtil;
    private final ReactiveRedisTemplate<String, String> redisTemplate;
    private final OpenWebClientUtil openWebClientUtil;

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange,
        Authentication authentication) {

        ServerWebExchange exchange = webFilterExchange.getExchange();
        ServerHttpResponse response = exchange.getResponse();

        CustomOAuth2User customUserDetail = (CustomOAuth2User) authentication.getPrincipal();
        String username = customUserDetail.getUsername();
        Long libraryId = customUserDetail.getLibraryId();
        Long userId = customUserDetail.getUserId();

        String email = customUserDetail.getEmail(); // 이메일로 사용자 식별
        boolean[] isRegistered = {customUserDetail.getIsRegistered()}; // 배열로 감싸야 내부에서 수정 가능

        return openWebClientUtil.getOrRegisterMemberInfo(email)
            .doOnNext(info -> {
                log.info("SSAFY 사용자 정보: {}", info);
                if (info.getUserKey() != null) {
                    isRegistered[0] = true;
                }
            })
            .onErrorResume(e -> {
                log.error("SSAFY API 연동 실패: {}", e.getMessage(), e);
                return Mono.empty(); // 실패해도 로그인 흐름은 계속 진행
            })
            .then(Mono.defer(() -> {
                String access = jwtUtil.createJwt(userId, libraryId, "access", username,
                    1_800_000L);
                String refresh = jwtUtil.createJwt(userId, libraryId, "refresh", username,
                    86400000L);

                String redisKey = "token" + userId;

                return redisTemplate.opsForValue()
                    .set(redisKey, refresh, Duration.ofSeconds(24 * 60 * 60))
                    .then(Mono.defer(() -> {
                        // 쿠키 설정
                        ResponseCookie refreshCookie = ResponseCookie.from("refresh", refresh)
                            .httpOnly(true)
                            .path("/")
                            .maxAge(24 * 60 * 60)
                            .build();
                        response.addCookie(refreshCookie);

                        // 리다이렉트
                        String encodedAccessToken = URLEncoder.encode(access,
                            StandardCharsets.UTF_8);
                        String redirectUrl = String.format(
                            "http://localhost:3000/#accessToken=%s&isRegistered=%s",
                            encodedAccessToken, isRegistered[0]);

                        log.info("Redirecting to frontend: {}", redirectUrl);
                        response.setStatusCode(HttpStatus.FOUND);
                        response.getHeaders().setLocation(java.net.URI.create(redirectUrl));

                        return response.setComplete();
                    }));
            }));
    }
}
