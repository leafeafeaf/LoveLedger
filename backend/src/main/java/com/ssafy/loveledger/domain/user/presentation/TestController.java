package com.ssafy.loveledger.domain.user.presentation;

import com.ssafy.loveledger.domain.user.presentation.dto.response.TestTokenResponse;
import com.ssafy.loveledger.global.auth.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final JWTUtil jwtUtil;

    @GetMapping("/token/{userId}")
    public ResponseEntity<TestTokenResponse>  generateTokenForUser(
        @PathVariable Long userId) {

        log.info("사용자 ID로 장기 유효 액세스 토큰 발급 요청 - 사용자 ID: {}", userId);

        // 8000시간 = 28,800,000,000 밀리초
        long expiredMs = 28800000000L;

        // 기본값으로 토큰 생성
        String accessToken = jwtUtil.createJwt(
            userId,
            1L, // 기본 라이브러리 ID
            "access", // 기본 카테고리
            "test-user-" + userId, // 기본 사용자명
            expiredMs
        );

        // 토큰 정보 생성 및 바로 반환 (SuccessResponseAdvice가 알아서 래핑)
        TestTokenResponse tokenResponse = TestTokenResponse.builder()
            .accessToken(accessToken)
            .expiresIn(expiredMs / 1000) // 초 단위로 변환
            .build();

        return ResponseEntity.ok(tokenResponse);
    }
}


