package com.ssafy.loveledger.domain.account.presentation.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class AccountResponse {

    private String accountId;
    private String bankCode;
    private LocalDateTime certedAt;
    private Long amount;
    private LocalDateTime lastUpdated;
}
