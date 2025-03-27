package com.ssafy.loveledger.domain.goal.presentation;

import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalCreateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalUpdateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.response.GoalReadResponse;
import com.ssafy.loveledger.domain.goal.service.GoalService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.global.util.UserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/goal")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;
    private final UserUtil userUtil;
    private final UserRepository userRepository;

    // 목표 생성
    @PostMapping
    public void createGoal(@RequestBody @Valid GoalCreateRequest goalCreateRequest) {
        User user = userUtil.getCurrentUser();

        log.info("user {} creates goal", user.getId());

        goalService.createGoal(goalCreateRequest, user);

    }

    // 목표 삭제
    @DeleteMapping
    public void deleteGoal() {
        User user = userUtil.getCurrentUser();

        log.info("user {} deletes goal", user.getId());

        goalService.deleteGoal(user);

    }

    // 목표 수정
    @PatchMapping
    public void updateGoal(@RequestBody @Valid GoalUpdateRequest goalUpdateRequest) {
        User user = userUtil.getCurrentUser();

        log.info("user {} updates goal", user.getId());

        goalService.updateGoal(goalUpdateRequest, user);

    }

    // 목표 조회
    @GetMapping
    public GoalReadResponse getGoals() {
        User user = userUtil.getCurrentUser();

        log.info("user {} reads goal", user.getId());

        return goalService.readGoal(user);

    }
}
