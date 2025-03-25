package com.ssafy.loveledger.domain.goal.presentation.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class GoalUpdateRequest {

    @NotNull(message = "목표 금액은 필수 사항입니다.")
    public Long goalAmount;

    @NotNull(message = "현재 소지 금액은 필수 사항입니다.")
    public Long currentAmount;

    @NotNull(message = "시작 날짜는 필수 사항입니다.")
    public LocalDate startDate;

    @NotNull(message = "목표 날짜는 필수 사항입니다.")
    public LocalDate goalDate;

    @NotBlank(message = "제목은 필수 사항입니다.")
    public String title;

    @NotBlank(message = "목표 그림 주소는 필수 사항입니다.")
    public String contentURL;

    @AssertTrue(message = "시작 날짜는 2000-01-01 이후여야 합니다.")
    public boolean isValidStartDate() {
        if (startDate == null) return false;
        return !startDate.isBefore(LocalDate.of(2000, 1, 1)) && !startDate.isAfter(LocalDate.now());
    }

    @AssertTrue(message = "시작 날짜는 목표 날짜보다 이전이어야 합니다.")
    public boolean isStartBeforeGoal() {
        if (startDate == null || goalDate == null) return false;
        return startDate.isBefore(goalDate) || startDate.isEqual(goalDate);
    }
}
