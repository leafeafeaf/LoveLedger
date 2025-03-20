package com.ssafy.loveledger.global.auth.handler;

import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.auth.util.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException, ServletException {

        CustomOAuth2User customUserDetail = (CustomOAuth2User) authentication.getPrincipal();
        String username = customUserDetail.getUsername();
        Long libraryId = customUserDetail.getLibraryId();
        Long userId = customUserDetail.getUserId();

        String access = jwtUtil.createJwt(userId, libraryId, "access", username, 600000L);
        String refresh = jwtUtil.createJwt(userId, libraryId, "refresh", username, 86400000L);

        // Redis에 refresh 토큰 저장
        String redisKey = "token";  // 요청한 대로 키를 'token'으로 설정
        redisTemplate.opsForValue().set(redisKey, refresh);
        redisTemplate.expire(redisKey, 24 * 60 * 60, TimeUnit.SECONDS); // 24시간 유효

        response.addCookie(createCookie("refresh", refresh));
        // Access 토큰을 URL 프래그먼트로 전달 (URL 인코딩 추가)
        String encodedAccessToken = URLEncoder.encode(access, StandardCharsets.UTF_8);
        String redirectUrl = "http://localhost:3000/#accessToken=" + encodedAccessToken;

        response.sendRedirect(redirectUrl);
    }

    private Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24 * 60 * 60);
        //    cookie.setSecure(true); // https
        cookie.setPath("/");
        cookie.setHttpOnly(true);

        return cookie;


    }
}
