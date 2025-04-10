package com.ssafy.mvcservice.global.util;

import com.ssafy.mvcservice.domain.user.domain.User;
import com.ssafy.mvcservice.domain.user.domain.repository.UserRepository;
import com.ssafy.mvcservice.global.response.exception.ErrorCode;
import com.ssafy.mvcservice.global.response.exception.LoveLedgerException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserUtil {

    private final UserRepository userRepository;

    public User getCurrentUser(HttpServletRequest request) {
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        Long userId = Long.parseLong(userIdHeader);
        return userRepository.findById(userId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND));
    }
}
