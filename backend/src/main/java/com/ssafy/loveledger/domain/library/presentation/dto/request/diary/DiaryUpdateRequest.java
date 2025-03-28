package com.ssafy.loveledger.domain.library.presentation.dto.request.diary;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DiaryUpdateRequest {

    @NotBlank(message = "제목은 필수 입력 값입니다.")
    @Size(max = 40, message = "제목은 최대 40자까지 입력 가능합니다.")
    String title;

    @NotBlank(message = "본문은 필수 입력 값입니다.")
    @Size(max = 500, message = "본문은 최대 500자까지 입력 가능합니다.")
    String content;
}
