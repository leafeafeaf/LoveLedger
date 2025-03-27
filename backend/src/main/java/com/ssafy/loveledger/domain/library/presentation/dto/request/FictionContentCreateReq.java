package com.ssafy.loveledger.domain.library.presentation.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class FictionContentCreateReq {

    @NotNull(message = "테마는 필수입니다.")
    private Long themeId;

    @NotNull(message = "시리즈는 필수입니다.")
    private Long seriesId;

    @NotNull(message = "시작 날짜는 필수입니다.")
    private LocalDate startDate;

    @NotNull(message = "끝 날짜는 필수입니다.")
    private LocalDate endDate;

    @AssertTrue(message = "시작 날짜는 2000-01-01 이후여야 합니다.")
    public boolean isValidStartDate() {
        if (startDate == null) return false;
        return !startDate.isBefore(LocalDate.of(2000, 1, 1)) && !startDate.isAfter(LocalDate.now());
    }

    @AssertTrue(message = "시작 날짜는 끝 날짜보다 이전이어야 합니다.")
    public boolean isStartBeforeGoal() {
        if (startDate == null || endDate == null) return false;
        return startDate.isBefore(endDate) || startDate.isEqual(endDate);
    }
}
