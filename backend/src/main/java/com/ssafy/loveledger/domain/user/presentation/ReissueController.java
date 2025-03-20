package com.ssafy.loveledger.domain.user.presentation;

import com.ssafy.loveledger.global.auth.util.JWTUtil;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ReissueController {

    private final JWTUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;


    @PostMapping("/reissue")
    public ResponseEntity<?> reissue(HttpServletRequest request, HttpServletResponse response) {

        String refresh = null;
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return new ResponseEntity<>("No cookies found", HttpStatus.BAD_REQUEST);
        }

        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("refresh")) {
                refresh = cookie.getValue();
            }
        }

        if (refresh == null) {
            return new ResponseEntity<>("refresh token null", HttpStatus.BAD_REQUEST);
        }

        // Redis에서 refresh 토큰 확인
        String redisKey = "token";
        String storedToken = redisTemplate.opsForValue().get(redisKey);

        if (storedToken == null) {
            return new ResponseEntity<>("Refresh token not found in Redis", HttpStatus.BAD_REQUEST);
        }

        if (!storedToken.equals(refresh)) {
            return new ResponseEntity<>("Invalid refresh token", HttpStatus.BAD_REQUEST);
        }

        try {
            if (jwtUtil.isExpired(refresh)) {
                // Redis에서 만료된 토큰 삭제
                redisTemplate.delete(redisKey);
                return new ResponseEntity<>("refresh token expired", HttpStatus.BAD_REQUEST);
            }
        } catch (ExpiredJwtException e) {
            // Redis에서 만료된 토큰 삭제
            redisTemplate.delete(redisKey);
            return new ResponseEntity<>("refresh token expried", HttpStatus.BAD_REQUEST);
        }
        // 토큰이 refresh인지 확인(발급시 페이로드에 명시)
        String category = jwtUtil.getCategory(refresh);
        if (!category.equals("refresh")) {
            return new ResponseEntity<>("invalid refresh token", HttpStatus.BAD_REQUEST);
        }
        // Redis에서 만료된 토큰 삭제
        redisTemplate.delete(redisKey);

        Long userId = jwtUtil.getUserId(refresh);
        Long libraryId = jwtUtil.getLibraryId(refresh);
        String username = jwtUtil.getUsername(refresh);
        String newAccess = jwtUtil.createJwt(userId, libraryId, "access", username, 600000L);
        String newRefresh = jwtUtil.createJwt(userId, libraryId, "refresh", username, 86400000L);

        response.setHeader("access", newAccess);
        response.addCookie(createCookie("refresh", newRefresh));

        return new ResponseEntity<>(HttpStatus.OK);
    }

    private Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24 * 60 * 60);
        //cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        return cookie;
    }
}
