package com.ssafy.loveledger.domain.user.presentation;

import com.ssafy.loveledger.domain.user.presentation.dto.request.UserInfoRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.request.UserUpdateRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.response.DetailUserResponse;
import com.ssafy.loveledger.domain.user.presentation.dto.response.UserResponse;
import com.ssafy.loveledger.domain.user.service.UserService;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.common.ApiResponse;
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
    public ResponseEntity<ApiResponse<DetailUserResponse>> detailUserInfo(
        @AuthenticationPrincipal CustomOAuth2User oAuth2User
    ) {
        if (oAuth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<DetailUserResponse>builder()
                    .status("401")
                    .message("인증 정보가 올바르지 않습니다")
                    .timestamp(LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                    .build());
        }

        Long userId = oAuth2User.getUserId();
        DetailUserResponse userInfo = userService.getDetailUserInfo(userId);

        return ResponseEntity.ok()
            .body(ApiResponse.<DetailUserResponse>builder()
                .status("200")
                .message("사용자 정보가 성공적으로 조회되었습니다")
                .data(userInfo)
                .timestamp(LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .build());
    }


    /* 유저 정보 입력 */
    @PutMapping
    public ResponseEntity<?> createUserInfo(
        @Valid @RequestBody UserInfoRequest request,
        Authentication authentication) {
        // 인증 객체 검증
        if (authentication == null
            || !(authentication.getPrincipal() instanceof CustomOAuth2User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.builder()
                    .status("401")
                    .message("인증 정보가 올바르지 않습니다")
                    .timestamp(java.time.LocalDateTime.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                    .build());
        }

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Long userId = oAuth2User.getUserId();

        // userId가 null인지 확인
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.builder()
                    .status("400")
                    .message("사용자 ID를 찾을 수 없습니다")
                    .timestamp(java.time.LocalDateTime.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                    .build());
        }

        // 정보 저장
        userService.saveUserInfo(userId, request);

        ApiResponse<Object> response = ApiResponse.builder()
            .status("200")
            .message("사용자 정보가 성공적으로 저장되었습니다")
            .data(null)
            .timestamp(java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
            .build();

        return ResponseEntity.ok().body(response);
    }

    /* 유저 정보 수정 */
    @PatchMapping
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
        @RequestBody UserUpdateRequest request,
        Authentication authentication) {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Long userId = oAuth2User.getUserId();

        // 사용자 정보 수정 서비스 호출
        UserResponse updatedUser = userService.updateUser(userId, request);

        // 응답 생성
        ApiResponse<UserResponse> response = ApiResponse.<UserResponse>builder()
            .status("200")
            .message("사용자 정보가 성공적으로 수정되었습니다")
            .data(updatedUser)
            .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
            .build();
        return ResponseEntity.ok().body(response);
    }
}
