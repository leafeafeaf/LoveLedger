package com.ssafy.loveledger.domain.library.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class FictionCreateReq {

    @NotBlank(message = "테마는 필수입니다.")
    private Long themeId;

    @NotBlank(message = "시리즈는 필수입니다.")
    private Long sereisId;

    @NotBlank(message = "소설 제목은 필수입니다.")
    private String title;

    @NotBlank(message = "소설 내용은 필수입니다.")
    private String content;

    @NotBlank(message = "소설 그림 url은 필수입니다.")
    private String imageUrl;

    @NotBlank(message = "시작 날짜는 필수입니다.")
    private LocalDate startDate;

    @NotBlank(message = "끝 날짜는 필수입니다.")
    private LocalDate endDate;

}
