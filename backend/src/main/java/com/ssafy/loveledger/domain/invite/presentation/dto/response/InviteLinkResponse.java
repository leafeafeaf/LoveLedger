package com.ssafy.loveledger.domain.invite.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteLinkResponse {
    private String link;
    private String inviteCode;
    private String createdAt;
    private String expiresAt;
    private Long remainingHours;
}
