package com.ssafy.loveledger.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common Error Codes
    INTERNAL_SERVER_ERROR(500, "C002", "서버 오류가 발생했습니다.", null),

    //Permission
    FORBIDDEN_ACCESS(403, "P001", "Forbidden: You do not have permission to access this resource",
        null),

    // Validation Error Codes
    INVALID_INPUT_VALUE(400, "V001", "유효하지 않은 입력값입니다", null),
    REQUIRED_FIELD_MISSING(400, "V002", "필수 항목이 누락되었습니다: %s", null),
    INVALID_FORMAT(400, "V003", "잘못된 형식입니다: %s", null),
    INVALID_LENGTH(400, "V004", "길이가 유효하지 않습니다: %s", null);

    private final int status; // HTTP 상태코드
    private final String code; // 비즈니스 에러
    private final String message; // 에러 메시지 템플릿
    private final String data;
}
