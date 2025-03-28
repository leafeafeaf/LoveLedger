package com.ssafy.loveledger.global.auth.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.loveledger.global.auth.util.JWTUtil;
import com.ssafy.loveledger.global.common.ApiResponse;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.GenericFilterBean;

@Slf4j
@RequiredArgsConstructor
public class CustomLogoutFilter extends GenericFilterBean {

    private final JWTUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 변환용


    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
    }

    private void doFilter(HttpServletRequest request, HttpServletResponse response,
        FilterChain filterChain) throws IOException, ServletException {

        //path and method verify
        String requestUri = request.getRequestURI();
        if (!requestUri.matches("^\\/user\\/logout$")) {
            filterChain.doFilter(request, response);
            return;
        }
        String requestMethod = request.getMethod();
        if (!requestMethod.equals("POST")) {

            filterChain.doFilter(request, response);
            return;
        }
        //get refresh token
        String refresh = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refresh")) {
                    refresh = cookie.getValue();
                    break;
                }
            }
        }

        log.info("#################= {}",refresh);
        //refresh null check
        if (refresh == null) {
            writeErrorResponse(response, HttpStatus.BAD_REQUEST, "리프레시 토큰이 존재하지 않습니다");
            return;
        }

        //expired check
        try {
            jwtUtil.isExpired(refresh);
        } catch (ExpiredJwtException e) {
            //response status code
            writeErrorResponse(response, HttpStatus.BAD_REQUEST, "리프레시 토큰이 만료되었습니다");
            return;
        }
        // 토큰이 refresh인지 확인 (발급시 페이로드에 명시)
        String category = jwtUtil.getCategory(refresh);
        if (!category.equals("refresh")) {

            //response status code
            writeErrorResponse(response, HttpStatus.BAD_REQUEST, "유효하지 않은 리프레시 토큰입니다");
            return;
        }
        // 1. 토큰에서 userId 추출
        Long userId = jwtUtil.getUserId(refresh);

        // 2. Redis key 구성
        String redisKey = "token" + userId;

        // 3. Redis에서 저장된 토큰 값 확인
        String storedRefresh = redisTemplate.opsForValue().get(redisKey);

        if (storedRefresh == null) {
            writeErrorResponse(response, HttpStatus.BAD_REQUEST, "이미 로그아웃된 토큰입니다");
            return;
        }
        //로그아웃 진행
        //Refresh 토큰 DB에서 제거
        redisTemplate.delete(refresh);

        //Refresh 토큰 Cookie 값 0
        Cookie cookie = new Cookie("refresh", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");

        response.addCookie(cookie);
        response.setStatus(HttpServletResponse.SC_OK);

    }
    private void writeErrorResponse(HttpServletResponse response, HttpStatus status, String message)
        throws IOException {
        ApiResponse<Object> errorResponse = ApiResponse.builder()
            .status(String.valueOf(status.value()))
            .message(message)
            .data(null)
            .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")))
            .build();

        response.setStatus(status.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
