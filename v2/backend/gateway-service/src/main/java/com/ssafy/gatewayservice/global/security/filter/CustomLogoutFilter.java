package com.ssafy.gatewayservice.global.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.gatewayservice.global.response.exception.ErrorCode;
import com.ssafy.gatewayservice.global.response.exception.ErrorResponse;
import com.ssafy.gatewayservice.global.security.util.JWTUtil;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomLogoutFilter implements WebFilter {

    private final JWTUtil jwtUtil;
    private final ReactiveRedisTemplate<String, String> reactiveRedisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // 1. 경로 & 메서드 확인
        if (!request.getURI().getPath().equals("/logout") || !request.getMethod()
            .equals(HttpMethod.POST)) {
            return chain.filter(exchange); // 로그아웃 외 요청은 그냥 통과
        }

        ServerHttpResponse response = exchange.getResponse();

        // 2. 쿠키에서 refresh 토큰 추출
        String refresh = null;
        if (request.getCookies().containsKey("refresh")) {
            refresh = request.getCookies().getFirst("refresh").getValue();
        }

        if (refresh == null) {
            return writeErrorResponse(response, HttpStatus.BAD_REQUEST, "리프레시 토큰이 존재하지 않습니다");
        }

        try {
            jwtUtil.isExpired(refresh);
        } catch (ExpiredJwtException e) {
            return writeErrorResponse(response, HttpStatus.BAD_REQUEST, "리프레시 토큰이 만료되었습니다");
        }

        String category = jwtUtil.getCategory(refresh);
        if (!"refresh".equals(category)) {
            return writeErrorResponse(response, HttpStatus.BAD_REQUEST, "유효하지 않은 리프레시 토큰입니다");
        }

        Long userId = jwtUtil.getUserId(refresh);
        String redisKey = "token" + userId;

        return reactiveRedisTemplate.opsForValue().get(redisKey)
            .flatMap(storedRefresh -> {
                if (storedRefresh == null) {
                    return writeErrorResponse(response, HttpStatus.BAD_REQUEST, "이미 로그아웃된 토큰입니다");
                }

                // Redis에서 삭제
                return reactiveRedisTemplate.delete(redisKey)
                    .then(Mono.defer(() -> {
                        // 쿠키 삭제
                        ResponseCookie deleteCookie = ResponseCookie.from("refresh", "")
                            .maxAge(0)
                            .path("/")
                            .httpOnly(true)
                            .build();
                        response.addCookie(deleteCookie);

                        response.setStatusCode(HttpStatus.OK);
                        return response.setComplete();
                    }));
            })
            .switchIfEmpty(writeErrorResponse(response, HttpStatus.BAD_REQUEST, "이미 로그아웃된 토큰입니다"));
    }

    private Mono<Void> writeErrorResponse(ServerHttpResponse response, HttpStatus status,
        String message) {
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        ErrorResponse errorResponse = ErrorResponse.of(ErrorCode.INVALID_TOKEN, message);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
        } catch (Exception e) {
            log.error("응답 변환 오류", e);
            response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
            return response.setComplete();
        }
    }

}
