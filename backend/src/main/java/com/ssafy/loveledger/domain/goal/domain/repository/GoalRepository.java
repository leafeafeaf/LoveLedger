package com.ssafy.loveledger.domain.goal.domain.repository;

import com.ssafy.loveledger.domain.goal.domain.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
}
