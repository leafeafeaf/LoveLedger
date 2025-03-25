package com.ssafy.loveledger.global.response.exception.handler;


import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.ErrorResponse;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(LoveLedgerException.class)
    protected ResponseEntity<ErrorResponse> handleCustomException(LoveLedgerException e) {
//        log.error("SplitException: {}", e.getMessage());

        ErrorResponse response = ErrorResponse.of(e.getErrorCode(), e.getArgs());
        return new ResponseEntity<>(response, HttpStatus.valueOf(e.getErrorCode().getStatus()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ErrorResponse> handleValidException(
        MethodArgumentNotValidException e) {

        String errorMessages = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage) // "제목은 필수 입력 값입니다."
            .collect(Collectors.joining(", ")); // 여러 개의 메시지를 ", "로 연결

        log.error("MethodArgumentNotValidException {} ", errorMessages);

        return handleCustomException(
            new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, errorMessages));
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Exception: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
