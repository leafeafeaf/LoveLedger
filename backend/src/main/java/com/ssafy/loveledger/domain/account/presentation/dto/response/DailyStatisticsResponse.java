package com.ssafy.loveledger.domain.account.presentation.dto.response;


import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class DailyStatisticsResponse {

    private LocalDate targetDate;
    private Long totalConsumeSum;
    private Long totalEarnSum;
}
