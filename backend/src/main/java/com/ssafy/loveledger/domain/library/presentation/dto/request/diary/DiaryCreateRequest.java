package com.ssafy.loveledger.domain.library.presentation.dto.request.diary;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DiaryCreateRequest {

    @NotBlank(message = "제목은 필수 입력 값입니다.")
    @Size(max = 40, message = "제목은 최대 40자까지 입력 가능합니다.")
    String title;

    @NotBlank(message = "본문은 필수 입력 값입니다.")
    @Size(max = 500, message = "본문은 최대 500자까지 입력 가능합니다.")
    String content;

    @NotNull(message = "일기 대상 날짜는 필수 입력 값입니다.")
    LocalDate targetDate;

    @AssertTrue(message = "미래 날짜는 일기를 작성하실 수 없습니다.")
    public boolean isValidTargetDate() {
        return targetDate == null || !targetDate.isAfter(LocalDate.now());
    }
}
