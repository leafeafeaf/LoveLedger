package com.ssafy.loveledger.domain.user.presentation;

import com.ssafy.loveledger.global.auth.util.JWTUtil;
import com.ssafy.loveledger.global.common.ApiResponse;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ReissueController {

    private final JWTUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String REFRESH_TOKEN_KEY_PREFIX = "token";


    @PostMapping("/reissue")
    public ApiResponse<?> reissue(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = extractRefreshToken(request);

        validateRefreshToken(refreshToken);

        Long userId = jwtUtil.getUserId(refreshToken);
        Long libraryId = jwtUtil.getLibraryId(refreshToken);
        String username = jwtUtil.getUsername(refreshToken);

        // 기존 refresh token 삭제
        redisTemplate.delete(REFRESH_TOKEN_KEY_PREFIX + userId);

        String newAccess = jwtUtil.createJwt(userId, libraryId, "access", username, 1_800_000L);
        String newRefresh = jwtUtil.createJwt(userId, libraryId, "refresh", username, 86_400_000L);

        //
        log.info("userId = {}", userId);
        // 새 refresh token Redis에 저장
        redisTemplate.opsForValue().set(REFRESH_TOKEN_KEY_PREFIX + userId, newRefresh);

        response.setHeader("access", newAccess);
        response.addCookie(createCookie("refresh", newRefresh));

        return null;
    }

    private Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24 * 60 * 60);
        //cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        return cookie;
    }

    private String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            throw new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, "No cookies found");
        }

        for (Cookie cookie : cookies) {
            if ("refresh".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        throw new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, "refresh token null");
    }

    private void validateRefreshToken(String refreshToken) {
        Long userId = jwtUtil.getUserId(refreshToken);

        String redisStoredToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_KEY_PREFIX + userId);

        if (redisStoredToken == null) {
            throw new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, "Refresh token not found in Redis");
        }

        if (!redisStoredToken.equals(refreshToken)) {
            throw new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, "Invalid refresh token");
        }

        if (jwtUtil.isExpired(refreshToken)) {
            redisTemplate.delete(REFRESH_TOKEN_KEY_PREFIX + userId);
            throw new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, "refresh token expired");
        }

        if (!"refresh".equals(jwtUtil.getCategory(refreshToken))) {
            throw new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, "Invalid token category");
        }
    }
}
