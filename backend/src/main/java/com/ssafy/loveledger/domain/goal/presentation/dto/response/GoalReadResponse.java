package com.ssafy.loveledger.domain.goal.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class GoalReadResponse {

    private Long goalAmount;
    private Long currentAmount;
    private LocalDate startDate;
    private LocalDate goalDate;
    private String title;
    private String contentUrl;
}
