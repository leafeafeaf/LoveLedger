package com.ssafy.loveledger.domain.account.presentation.dto.response;


import com.ssafy.loveledger.domain.statistics.domain.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class MonthlyStatisticsResponse {

    private Category category;
    private Long ConsumeSum;
    private Long EarnSum;
}
