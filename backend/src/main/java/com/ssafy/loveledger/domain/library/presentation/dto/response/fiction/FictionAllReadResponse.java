package com.ssafy.loveledger.domain.library.presentation.dto.response.fiction;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class FictionAllReadResponse {
    private Long seriesId;
    private String seriesName;
    private List<FictionReadResponse> fictions;
}