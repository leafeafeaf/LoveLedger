package com.ssafy.loveledger.domain.story.presentation.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FastAPI로 전송할 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueryRequest {
    private String query;
    private List<Map<String, Object>> transactions;

    @JsonProperty("date_range")
    private Map<String, String> dateRange;

    private String gender;

    @JsonProperty("marital_status")
    private boolean maritalStatus;

    @JsonProperty("previous_story")
    private String previousStory = "";

    private String theme;
}