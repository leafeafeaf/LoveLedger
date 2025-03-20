package com.ssafy.loveledger.domain.account.presentation.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class HistoryDetailResponse {

    private String transactionId;
    private LocalDate date;
    private LocalTime time;
    private Boolean remittance;
    private String targetName;
    private String CategoryName;
    private Long afterAmount;
    private Long amount;
}
