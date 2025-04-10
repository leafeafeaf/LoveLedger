package com.ssafy.mvcservice.domain.goal.presentation;

import com.ssafy.mvcservice.domain.goal.presentation.dto.request.GoalCreateRequest;
import com.ssafy.mvcservice.domain.goal.presentation.dto.request.GoalUpdateRequest;
import com.ssafy.mvcservice.domain.goal.presentation.dto.response.GoalReadResponse;
import com.ssafy.mvcservice.domain.goal.service.GoalService;
import com.ssafy.mvcservice.domain.user.domain.User;
import com.ssafy.mvcservice.global.util.UserUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/goal")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final UserUtil userUtil;

    // 목표 생성
    @PostMapping
    public void createGoal(@RequestBody @Valid GoalCreateRequest goalCreateRequest,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} creates goal", user.getId());

        goalService.createGoal(goalCreateRequest, user);

    }

    // 목표 삭제
    @DeleteMapping
    public void deleteGoal(HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} deletes goal", user.getId());

        goalService.deleteGoal(user);

    }

    // 목표 수정
    @PatchMapping
    public void updateGoal(@RequestBody @Valid GoalUpdateRequest goalUpdateRequest,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} updates goal", user.getId());

        goalService.updateGoal(goalUpdateRequest, user);

    }

    // 목표 조회
    @GetMapping
    public GoalReadResponse getGoals(HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} reads goal", user.getId());

        return goalService.readGoal(user);

    }
}
