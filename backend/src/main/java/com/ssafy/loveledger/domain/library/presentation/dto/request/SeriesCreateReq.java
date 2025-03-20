package com.ssafy.loveledger.domain.library.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeriesCreateReq {

    @NotBlank(message = "제목은 필수 입력값입니다.")
    @Size(max = 40, message = "제목은 최대 40자까지 입력 가능합니다.")
    private String title;

}
