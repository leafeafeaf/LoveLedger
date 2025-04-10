package com.ssafy.gatewayservice.global.webclient.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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