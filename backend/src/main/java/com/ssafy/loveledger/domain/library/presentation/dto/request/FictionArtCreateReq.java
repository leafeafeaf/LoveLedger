package com.ssafy.loveledger.domain.library.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FictionArtCreateReq {

    @NotBlank(message = "소설 내용은 필수입니다.")
    private String content;

    @NotNull(message = "소설 테마는 필수입니다.")
    private Long themeId;

    @NotBlank(message = "소설 제목은 필수입니다.")
    private String title;
}
