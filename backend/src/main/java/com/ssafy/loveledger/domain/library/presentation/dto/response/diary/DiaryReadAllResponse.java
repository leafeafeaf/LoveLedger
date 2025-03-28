package com.ssafy.loveledger.domain.library.presentation.dto.response.diary;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class DiaryReadAllResponse {

    Long id;
    String title;
    String content;
    LocalDate targetDate;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
