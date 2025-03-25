package com.ssafy.loveledger.global.response.exception;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private String code;
    private int status;
    private String message;
    private String timestamp;
    private Object data;

    public static ErrorResponse of(ErrorCode errorCode, String... args) {
        return ErrorResponse.builder()
            .code(errorCode.getCode())
            .status(errorCode.getStatus())
            .data(errorCode.getData())
            .message(String.format(errorCode.getMessage(), (Object[]) args))
            .timestamp(LocalDateTime.now().toString())
            .build();
    }


}
