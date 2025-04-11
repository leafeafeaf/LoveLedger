package com.ssafy.webfluxservice.global.util;

import com.ssafy.webfluxservice.domain.user.domain.User;
import com.ssafy.webfluxservice.domain.user.domain.repository.UserRepository;
import com.ssafy.webfluxservice.global.response.exception.ErrorCode;
import com.ssafy.webfluxservice.global.response.exception.LoveLedgerException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserUtil {

    private final UserRepository userRepository;

    public Mono<User> getCurrentUser(ServerHttpRequest request) {
        String userIdHeader = request.getHeaders().getFirst("X-User-Id");

        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        try {
            Long userId = Long.parseLong(userIdHeader);

            return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new LoveLedgerException(ErrorCode.USER_NOT_FOUND)));

        } catch (NumberFormatException e) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }
    }

    public Long getLibraryId(ServerHttpRequest request) {
        String libraryIdHeader = request.getHeaders().getFirst("X-Library-Id");

        if (libraryIdHeader == null || libraryIdHeader.isBlank()) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        try {
            return Long.parseLong(libraryIdHeader);
        } catch (NumberFormatException e) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }
    }
}
