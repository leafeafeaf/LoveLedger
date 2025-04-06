package com.ssafy.loveledger.domain.user.presentation;

import com.ssafy.loveledger.domain.user.presentation.dto.request.UserInfoRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.request.UserUpdateRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.response.DetailUserResponse;
import com.ssafy.loveledger.domain.user.presentation.dto.response.UserResponse;
import com.ssafy.loveledger.domain.user.service.UserService;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.common.ApiResponse;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    /* 유저 상세 정보 */
    @GetMapping
    public DetailUserResponse detailUserInfo(
        @AuthenticationPrincipal CustomOAuth2User oAuth2User
    ) {
        Long userId = oAuth2User.getUserId();
        DetailUserResponse detailUserInfo = userService.getDetailUserInfo(userId);
        return detailUserInfo;
    }

    /* 유저 정보 입력 */
    @PutMapping
    public void createUserInfo(
        @Valid @RequestBody UserInfoRequest request,
        Authentication authentication) {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Long userId = oAuth2User.getUserId();

        // userId가 null인지 확인
        if (userId == null) {
            throw new LoveLedgerException(ErrorCode.USER_NOT_FOUND, "유저 ID를 찾을 수 없습니다.");
        }

        // 정보 저장
        userService.saveUserInfo(userId, request);
    }

    /* 유저 정보 수정 */
    @PatchMapping
    public UserResponse updateUser(
        @RequestBody UserUpdateRequest request,
        Authentication authentication) {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Long userId = oAuth2User.getUserId();

        // 사용자 정보 수정 서비스 호출
        UserResponse updatedUser = userService.updateUser(userId, request);

        return updatedUser;
    }
}
