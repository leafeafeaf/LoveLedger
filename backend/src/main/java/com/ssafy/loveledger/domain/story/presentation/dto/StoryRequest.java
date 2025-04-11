package com.ssafy.loveledger.domain.story.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoryRequest {
    private String query;
    private String startDate;
    private String endDate;
    private String gender;
    private boolean maritalStatus;
    private String theme;
}
