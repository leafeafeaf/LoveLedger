package com.ssafy.mvcservice.domain.goal.service;

import com.ssafy.mvcservice.domain.goal.domain.Goal;
import com.ssafy.mvcservice.domain.goal.domain.repository.GoalRepository;
import com.ssafy.mvcservice.domain.goal.presentation.dto.request.GoalCreateRequest;
import com.ssafy.mvcservice.domain.goal.presentation.dto.request.GoalUpdateRequest;
import com.ssafy.mvcservice.domain.goal.presentation.dto.response.GoalReadResponse;
import com.ssafy.mvcservice.domain.user.domain.User;
import com.ssafy.mvcservice.global.response.exception.ErrorCode;
import com.ssafy.mvcservice.global.response.exception.LoveLedgerException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class GoalService {

    private final GoalRepository goalRepository;

    // 목표 생성
    @Transactional
    public void createGoal(GoalCreateRequest goalCreateRequest, User user) {

        if (goalRepository.existsById(user.getId())) {
            throw new LoveLedgerException(ErrorCode.GOAL_Exist);
        }

        Goal goal = Goal.builder()
            .id(user.getId())
            .goalAmount(goalCreateRequest.getGoalAmount())
            .currentAmount(goalCreateRequest.getCurrentAmount())
            .startDate(goalCreateRequest.getStartDate())
            .goalDate(goalCreateRequest.getGoalDate())
            .title(goalCreateRequest.getTitle())
            .contentURL(goalCreateRequest.getContentURL())
            .build();

        //TODO : S3 연결 필요.
        goalRepository.save(goal);
    }

    // 목표 삭제
    @Transactional
    public void deleteGoal(User user) {

        // 사용자의 목표 여부 확인
        if (!goalRepository.existsById(user.getId())) {
            throw new LoveLedgerException(ErrorCode.GOAL_NOT_FOUND);
        }

        goalRepository.deleteById(user.getId());
    }

    //목표 수정
    @Transactional
    public void updateGoal(GoalUpdateRequest goalUpdateRequest, User user) {

        // 유저에게 목표가 존재하는지 확인
        Goal goal = goalRepository.findById(user.getId())
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
    public GoalReadResponse readGoal(User user) {

        // 유저에게 목표가 존재하는지 확인
        Goal goal = goalRepository.findById(user.getId())
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
