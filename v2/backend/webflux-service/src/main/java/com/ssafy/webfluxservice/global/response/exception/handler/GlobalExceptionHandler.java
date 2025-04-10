package com.ssafy.webfluxservice.global.response.exception.handler;


import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.ssafy.webfluxservice.global.response.exception.ErrorCode;
import com.ssafy.webfluxservice.global.response.exception.ErrorResponse;
import com.ssafy.webfluxservice.global.response.exception.LoveLedgerException;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import reactor.core.publisher.Mono;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(LoveLedgerException.class)
    protected Mono<ResponseEntity<ErrorResponse>> handleCustomException(LoveLedgerException e) {
        ErrorResponse response = ErrorResponse.of(e.getErrorCode(), e.getArgs());

        return Mono.just(ResponseEntity
            .status(e.getErrorCode().getStatus())
            .body(response));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected Mono<ResponseEntity<ErrorResponse>> handleValidException(
        MethodArgumentNotValidException e) {

        String errorMessages = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));

        log.error("MethodArgumentNotValidException: {}", errorMessages);

        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT_VALUE, errorMessages);

        return Mono.just(ResponseEntity
            .status(ErrorCode.INVALID_INPUT_VALUE.getStatus())
            .body(response));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    protected Mono<ResponseEntity<ErrorResponse>> handleHttpMessageNotReadable(
        HttpMessageNotReadableException e) {
        log.error("HttpMessageNotReadableException: {}", e.getMessage());

        String message = "요청 값 형식이 올바르지 않습니다.";

        if (e.getCause() instanceof InvalidFormatException) {
            message = "숫자 필드에 문자열이 들어왔거나 형식이 잘못되었습니다.";
        }

        ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT_VALUE, message);

        return Mono.just(ResponseEntity
            .status(ErrorCode.INVALID_INPUT_VALUE.getStatus())
            .body(response));
    }

    @ExceptionHandler(Exception.class)
    protected Mono<ResponseEntity<ErrorResponse>> handleGenericException(Exception e) {
        log.error("Exception: {}", e.getMessage(), e);

        ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR);

        return Mono.just(ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(response));
    }

}
