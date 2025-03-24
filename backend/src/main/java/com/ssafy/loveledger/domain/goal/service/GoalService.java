package com.ssafy.loveledger.domain.goal.service;

import com.ssafy.loveledger.domain.goal.domain.Goal;
import com.ssafy.loveledger.domain.goal.domain.repository.GoalRepository;
import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalCreateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalUpdateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.response.GoalReadResponse;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@RequiredArgsConstructor
@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    // 목표 생성
    @Transactional
    public void createGoal(GoalCreateRequest goalCreateRequest, Long userId) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (goalRepository.existsById(userId)) {
            throw new IllegalStateException("해당 유저는 이미 목표가 존재합니다.");
        }

        Goal goal = Goal.builder()
            .id(userId)
            .goalAmount(goalCreateRequest.getGoalAmount())
            .currentAmount(goalCreateRequest.getCurrentAmount())
            .startDate(goalCreateRequest.getStartDate())
            .goalDate(goalCreateRequest.getGoalDate())
            .title(goalCreateRequest.getTitle())
            .contentURL(goalCreateRequest.getContentURL())
            .build();

        goalRepository.save(goal);
    }

    // 목표 삭제
    @Transactional
    public void deleteGoal(Long userId) {

        if (!goalRepository.existsById(userId)) {
            throw new NoSuchElementException("해당 목표는 존재하지 않습니다.");
        }
        goalRepository.deleteById(userId);
    }

    //목표 수정
    @Transactional
    public void updateGoal(GoalUpdateRequest goalUpdateRequest, Long userId) {

        // 유저에게 목표가 존재하는지 확인
        Goal goal = goalRepository.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("해당 유저에게 목표는 존재하지 않습니다."));

        goal.setGoalAmount(goalUpdateRequest.getGoalAmount());
        goal.setCurrentAmount(goalUpdateRequest.getCurrentAmount());
        goal.setStartDate(goalUpdateRequest.getStartDate());
        goal.setGoalDate(goalUpdateRequest.getGoalDate());
        goal.setTitle(goalUpdateRequest.getTitle());
        goal.setContentURL(goalUpdateRequest.getContentURL());

        goalRepository.save(goal);
    }

    // 목표 조회
    @Transactional
    public GoalReadResponse readGoal(Long userId) {

        // 유저에게 목표가 존재하는지 확인
        Goal goal = goalRepository.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("해당 유저에게 목표는 존재하지 않습니다."));

        return GoalReadResponse.builder()
            .goalAmount(goal.getGoalAmount())
            .currentAmount(goal.getCurrentAmount())
            .startDate(goal.getStartDate())
            .goalDate(goal.getGoalDate())
            .title(goal.getTitle())
            .contentUrl(goal.getContentURL())
            .build();
    }
}
