package com.ssafy.loveledger.domain.goal.presentation;

import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalCreateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalUpdateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.response.GoalReadResponse;
import com.ssafy.loveledger.domain.goal.service.GoalService;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/goal")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    // 목표 생성
    @PostMapping
    public ResponseEntity<ApiResponse> createGoal(@RequestBody @Valid GoalCreateRequest goalCreateRequest, @AuthenticationPrincipal CustomOAuth2User user) {

        goalService.createGoal(goalCreateRequest, user.getUserId());

        return ResponseEntity.ok(ApiResponse.success("목표 생성 완료", null));
    }

    // 목표 삭제
    @DeleteMapping
    public ResponseEntity<ApiResponse> deleteGoal(@AuthenticationPrincipal CustomOAuth2User user) {

        goalService.deleteGoal(user.getUserId());

        return ResponseEntity.ok(ApiResponse.success("목표 삭제 완료", null));
    }

    // 목표 수정
    @PatchMapping
    public ResponseEntity<ApiResponse> updateGoal(@RequestBody @Valid GoalUpdateRequest goalUpdateRequest, @AuthenticationPrincipal CustomOAuth2User user) {

        goalService.updateGoal(goalUpdateRequest, user.getUserId());

        return ResponseEntity.ok(ApiResponse.success("목표 수정 완료", null));
    }

    // 목표 조회
    @GetMapping
    public GoalReadResponse getGoals(@AuthenticationPrincipal CustomOAuth2User user) {

        return goalService.readGoal(user.getUserId());

    }
}
