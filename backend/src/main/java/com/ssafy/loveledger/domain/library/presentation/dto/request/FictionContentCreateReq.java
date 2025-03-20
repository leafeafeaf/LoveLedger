package com.ssafy.loveledger.domain.library.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class FictionContentCreateReq {

    @NotBlank(message = "테마는 필수입니다.")
    private Long themeId;

    @NotBlank(message = "시리즈는 필수입니다.")
    private Long seriesId;

    @NotBlank(message = "시작 날짜는 필수입니다.")
    private LocalDate startDate;

    @NotBlank(message = "끝 날짜는 필수입니다.")
    private LocalDate endDate;
}
