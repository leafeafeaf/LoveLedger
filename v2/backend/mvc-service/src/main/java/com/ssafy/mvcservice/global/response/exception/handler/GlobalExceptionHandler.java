package com.ssafy.mvcservice.global.response.exception.handler;


import com.ssafy.mvcservice.global.response.exception.ErrorCode;
import com.ssafy.mvcservice.global.response.exception.ErrorResponse;
import com.ssafy.mvcservice.global.response.exception.LoveLedgerException;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));

        log.error("MethodArgumentNotValidException {} ", errorMessages);

        return handleCustomException(
            new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, errorMessages));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    protected ResponseEntity<ErrorResponse> handleNoResourceFoundException(
        NoResourceFoundException e) {
        log.warn("NoResourceFoundException: {}", e.getMessage());

        return handleCustomException(
            new LoveLedgerException(ErrorCode.NOT_FOUND, "존재하지 않는 경로입니다."));
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Exception: {}", e.getMessage());

        if (e instanceof HttpMessageNotReadableException) {
            Throwable cause = e.getCause();

            String message = "요청 값 형식이 올바르지 않습니다.";
            if (cause instanceof com.fasterxml.jackson.databind.exc.InvalidFormatException) {
                message = "숫자 필드에 문자열이 들어왔거나 형식이 잘못되었습니다.";
            }

            return handleCustomException(
                new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, message));
        }

        ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
