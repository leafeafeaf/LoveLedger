package com.ssafy.loveledger.global.config.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.loveledger.global.exception.ErrorCode;
import com.ssafy.loveledger.global.exception.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public CustomAuthenticationEntryPoint() {
        objectMapper = new ObjectMapper();
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
        AuthenticationException authException) throws IOException, ServletException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setCharacterEncoding("UTF-8");

        ErrorResponse errorResponse = new ErrorResponse(
            ErrorCode.FORBIDDEN_ACCESS.getCode(),
            ErrorCode.FORBIDDEN_ACCESS.getStatus(),
            ErrorCode.FORBIDDEN_ACCESS.getMessage(),
            ErrorCode.FORBIDDEN_ACCESS.getData(),
            LocalDateTime.now().toString()
        );

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}

