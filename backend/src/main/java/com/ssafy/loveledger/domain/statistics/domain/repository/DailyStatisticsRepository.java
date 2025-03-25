package com.ssafy.loveledger.domain.statistics.domain.repository;

import com.ssafy.loveledger.domain.statistics.domain.DailyStatistics;
import com.ssafy.loveledger.domain.statistics.domain.key.DayId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyStatisticsRepository extends JpaRepository<DailyStatistics, DayId> {
    
}
