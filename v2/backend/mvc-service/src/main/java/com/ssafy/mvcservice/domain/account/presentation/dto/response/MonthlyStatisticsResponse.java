package com.ssafy.mvcservice.domain.account.presentation.dto.response;


import com.ssafy.mvcservice.domain.statistics.domain.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
public class MonthlyStatisticsResponse {

    private String categoryName;
    private Long consumeSum;
    private Long earnSum;

    public MonthlyStatisticsResponse(Category category, Long consumeSum, Long earnSum) {
        this.categoryName = category.getName();  // Enum의 name 필드 사용
        this.consumeSum = consumeSum;
        this.earnSum = earnSum;
    }
}
