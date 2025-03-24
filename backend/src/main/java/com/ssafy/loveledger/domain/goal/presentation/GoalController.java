package com.ssafy.loveledger.domain.goal.presentation;

import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalCreateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalUpdateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.response.GoalReadResponse;
import com.ssafy.loveledger.domain.goal.service.GoalService;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
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
    public ResponseEntity<?> createGoal(@RequestBody GoalCreateRequest goalCreateRequest, @AuthenticationPrincipal CustomOAuth2User customOAuth2User) {

        goalService.createGoal(goalCreateRequest, customOAuth2User.getUserId());

        return ResponseEntity.ok("목표 생성 완료");
    }

    // 목표 삭제
    @DeleteMapping
    public ResponseEntity<?> deleteGoal(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {

        goalService.deleteGoal(customOAuth2User.getUserId());

        return ResponseEntity.ok("목표 삭제 완료");
    }

    // 목표 수정
    @PatchMapping
    public ResponseEntity<?> updateGoal(@RequestBody GoalUpdateRequest goalUpdateRequest, @AuthenticationPrincipal CustomOAuth2User customOAuth2User) {

        goalService.updateGoal(goalUpdateRequest, customOAuth2User.getUserId());

        return ResponseEntity.ok("목표 수정 완료");
    }

    // 목표 조회
    @GetMapping
    public ResponseEntity<?> getGoals(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {

        GoalReadResponse goalReadResponse = goalService.readGoal(customOAuth2User.getUserId());

        return ResponseEntity.ok(goalReadResponse);
    }
}
