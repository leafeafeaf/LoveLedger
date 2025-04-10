package com.ssafy.mvcservice.domain.library.presentation.dto.request.fiction;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FictionReadRequest {
    private String title;
    private String content;
}
