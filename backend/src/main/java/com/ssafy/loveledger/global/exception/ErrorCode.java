package com.ssafy.loveledger.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common Error Codes
    INTERNAL_SERVER_ERROR(500, "C002", "서버 오류가 발생했습니다."),

    //Permission
    FORBIDDEN_ACCESS(403, "P001", "Forbidden: You do not have permission to access this resource");

    private final int status; // HTTP 상태코드
    private final String code; // 비즈니스 에러
    private final String message; // 에러 메시지 템플릿
}
