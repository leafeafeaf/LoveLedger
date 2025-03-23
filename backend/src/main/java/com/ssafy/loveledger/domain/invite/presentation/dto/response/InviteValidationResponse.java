package com.ssafy.loveledger.domain.invite.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteValidationResponse {
    private String email;
    private String name;
}