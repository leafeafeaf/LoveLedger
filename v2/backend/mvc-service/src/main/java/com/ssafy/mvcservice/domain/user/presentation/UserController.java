package com.ssafy.mvcservice.domain.user.presentation;

import com.ssafy.mvcservice.domain.user.domain.User;
import com.ssafy.mvcservice.domain.user.presentation.dto.request.UserInfoRequest;
import com.ssafy.mvcservice.domain.user.presentation.dto.request.UserUpdateRequest;
import com.ssafy.mvcservice.domain.user.presentation.dto.response.DetailUserResponse;
import com.ssafy.mvcservice.domain.user.presentation.dto.response.UserResponse;
import com.ssafy.mvcservice.domain.user.service.UserService;
import com.ssafy.mvcservice.global.response.exception.ErrorCode;
import com.ssafy.mvcservice.global.response.exception.LoveLedgerException;
import com.ssafy.mvcservice.global.util.UserUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    private final UserUtil userUtil;

    /* 유저 상세 정보 */
    @GetMapping
    public DetailUserResponse detailUserInfo(
        HttpServletRequest request
    ) {
        User user = userUtil.getCurrentUser(request);
        Long userId = user.getId();
        DetailUserResponse detailUserInfo = userService.getDetailUserInfo(userId);
        return detailUserInfo;
    }

    /* 유저 정보 입력 */
    @PutMapping
    public void createUserInfo(
        @Valid @RequestBody UserInfoRequest userInfoRequest,
        HttpServletRequest request) {

        User user = userUtil.getCurrentUser(request);
        Long userId = user.getId();

        // userId가 null인지 확인
        if (userId == null) {
            throw new LoveLedgerException(ErrorCode.USER_NOT_FOUND, "유저 ID를 찾을 수 없습니다.");
        }

        // 정보 저장
        userService.saveUserInfo(userId, userInfoRequest);
    }

    /* 유저 정보 수정 */
    @PatchMapping
    public UserResponse updateUser(
        @RequestBody UserUpdateRequest userUpdateRequest,
        HttpServletRequest request) {

        User user = userUtil.getCurrentUser(request);
        Long userId = user.getId();

        // 사용자 정보 수정 서비스 호출
        UserResponse updatedUser = userService.updateUser(userId, userUpdateRequest);

        return updatedUser;
    }
}
