package com.ssafy.loveledger.domain.library.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SeriesReadResponse {

    private String title;
    private Long seriesId;

}
