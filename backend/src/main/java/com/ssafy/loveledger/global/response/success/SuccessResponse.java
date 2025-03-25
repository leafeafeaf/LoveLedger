package com.ssafy.loveledger.global.response.success;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SuccessResponse {

    private final boolean success = true;
    private final int status;
    private final Object data;

    @JsonFormat(pattern = "yyyy-MM-dd kk:mm:ss")
    private LocalDateTime timestamp;

    public static SuccessResponse success(int status, Object data) {
        return SuccessResponse.builder()
            .status(status)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
