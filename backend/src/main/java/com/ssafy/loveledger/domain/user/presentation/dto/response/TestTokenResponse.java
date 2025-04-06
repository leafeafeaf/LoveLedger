package com.ssafy.loveledger.domain.user.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public
class TestTokenResponse {
    private String accessToken; // 발급된 액세스 토큰
    private long expiresIn;     // 토큰 유효 시간(초)
}
