package com.ssafy.loveledger.domain.goal.service;

import com.ssafy.loveledger.domain.goal.domain.Goal;
import com.ssafy.loveledger.domain.goal.domain.repository.GoalRepository;
import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalCreateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.request.GoalUpdateRequest;
import com.ssafy.loveledger.domain.goal.presentation.dto.response.GoalReadResponse;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class GoalService {

    private final GoalRepository goalRepository;

    // 목표 생성
    @Transactional
    public void createGoal(GoalCreateRequest goalCreateRequest, Long userId) {

        if (goalRepository.existsById(userId)) {
            throw new LoveLedgerException(ErrorCode.GOAL_Exist);
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

        // 사용자의 목표 여부 확인
        if (!goalRepository.existsById(userId)) {
            throw new LoveLedgerException(ErrorCode.GOAL_NOT_FOUND);
        }

        goalRepository.deleteById(userId);
    }

    //목표 수정
    @Transactional
    public void updateGoal(GoalUpdateRequest goalUpdateRequest, Long userId) {

        // 유저에게 목표가 존재하는지 확인
        Goal goal = goalRepository.findById(userId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.GOAL_NOT_FOUND));

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
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.GOAL_NOT_FOUND));

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
