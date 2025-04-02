package com.ssafy.loveledger.global.openai.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자 계정 생성 요청 DTO
 * SSAFY 교육용 금융망 API의 회원 등록 요청 형식
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberRegistrationRequest {
    /**
     * api 키 (앱 관리자가 SSAFY 개발센터에서 발급받은 API KEY)
     */
    private String apiKey;

    /**
     * 사용자 ID (이메일 형식)
     */
    private String userId;
}