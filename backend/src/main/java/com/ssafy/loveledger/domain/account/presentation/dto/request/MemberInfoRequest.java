package com.ssafy.loveledger.domain.account.presentation.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class MemberInfoRequest {

    private String apiKey;
    private String userId;
}
