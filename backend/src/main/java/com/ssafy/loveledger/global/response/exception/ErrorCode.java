package com.ssafy.loveledger.global.response.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common Error Codes
    INTERNAL_SERVER_ERROR(500, "C999", "서버 오류가 발생했습니다.", null),

    //Permission
    FORBIDDEN_ACCESS(403, "P001", "Forbidden: You do not have permission to access this resource",
        null),
    //User
    USER_NOT_FOUND(404, "U001", "해당 계정이 존재하지 않습니다.", null),

    //Account
    ACCOUNT_NOT_FOUND(404, "A001", "해당 사용자의 계좌 정보를 찾을 수 없습니다.", null),

    //History
    HISTORY_NOT_FOUND(404, "H001", "거래 내역을 찾을 수 없습니다.", null),
    TRANSACTION_SIZE_MISMATCH(400, "T001", "거래 IDs와 TargetName 의 개수가 일치해야 합니다.", null),

    OPENFEIGN_FAILED(402, "F001", "알 수 없는 오류가 발생했습니다.", null),



    //Diary
    DIARY_NOT_FOUND(404, "D001", "해당 일기(ID: %s)를 찾을 수 없습니다.", null),

    //Couple
    COUPLE_NOT_FOUND(404, "C001", "해당커플Id를 찾을 수가 없습니다. %s", null),
    INVALID_INVITE_CODE(400, "C003", "유효하지 않은 초대 코드입니다: %s", null),
    INVITE_EXPIRED(400, "C005", "초대 링크가 만료되었습니다: %s", null),
    ALREADY_COUPLED(409, "C002", "이미 연동되어 있는 계정입니다 (사용자 ID: %s)", null),

    //invite
    INVALID_REQUEST(400, "I001", "자기자신과 연동은 안됩니다.", null),

    //Series
    SERIES_NOT_FOUND(404, "S001", "해당 시리즈(ID: %s)를 찾을 수 없습니다.", null),

    //Theme
    THEME_NOT_FOUND(404, "T001", "해당 테마(ID: %s)를 찾을 수 없습니다.", null),

    // Fiction
    FICTION_NOT_FOUND(404, "F001", "해당 소설(ID: %s)를 찾을 수 없습니다.", null),

    // Goal
    GOAL_NOT_FOUND(409, "G001", "사용자의 목표를 찾을 수 없습니다.", null),
    GOAL_Exist(409, "G002", "사용자의 목표가 존재합니다.", null),

    // Validation Error Codes
    INVALID_INPUT_VALUE(400, "V001", "입력값 오류 : %s", null),
    REQUIRED_FIELD_MISSING(400, "V002", "필수 항목이 누락되었습니다: %s", null),
    INVALID_FORMAT(400, "V003", "잘못된 형식입니다: %s", null),
    INVALID_LENGTH(400, "V004", "길이가 유효하지 않습니다: %s", null),
    INVALID_DATE_FORMAT(400, "V005", "잘못된 날짜 형식입니다. 올바른 형식은 yyyy-MM-dd입니다: %s", null);

    private final int status; // HTTP 상태코드
    private final String code; // 비즈니스 에러
    private final String message; // 에러 메시지 템플릿
    private final String data;
}
