package com.ssafy.loveledger.domain.library.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class FictionReadResponse {

    private Long fictionId;
    private String title;
    private String artUrl;
    private LocalDateTime createdAt;
}
