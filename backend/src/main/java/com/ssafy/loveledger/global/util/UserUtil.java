package com.ssafy.loveledger.global.util;

import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.auth.util.JWTUtil;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserUtil {

    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth.getPrincipal().equals("anonymousUser")) {
            throw new LoveLedgerException(
                ErrorCode.FORBIDDEN_ACCESS
            );
        }

        CustomOAuth2User user = (CustomOAuth2User) auth.getPrincipal();
        return userRepository.findById(user.getUserId()).orElseThrow(RuntimeException::new);
    }

    public User getCurrentUser(String token) {
        if (token == null || token.isEmpty()) {
            throw new RuntimeException();
        }
        Long userId = jwtUtil.getUserId(token);
        return userRepository.findById(userId).orElseThrow(RuntimeException::new);
    }
}
