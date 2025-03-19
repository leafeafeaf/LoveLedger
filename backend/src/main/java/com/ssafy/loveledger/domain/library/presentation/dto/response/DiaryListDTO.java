package com.ssafy.loveledger.domain.library.presentation.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class DiaryListDTO {

    private List<DiaryReadDTO> diaries;
}
