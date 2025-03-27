package com.ssafy.loveledger.global.response.exception;

import lombok.Getter;

@Getter
public class LoveLedgerException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String[] args;


    public LoveLedgerException(ErrorCode errorCode, String... args) {
        super(String.format(errorCode.getMessage(), (Object[]) args));
        this.errorCode = errorCode;
        this.args = args;
    }

}
