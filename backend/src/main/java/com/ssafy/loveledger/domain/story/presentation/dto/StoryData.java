package com.ssafy.loveledger.domain.story.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FastAPI로부터 받는 단순화된 응답 DTO (title과 content만 포함)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryData {
    private String title;
    private String content;
}