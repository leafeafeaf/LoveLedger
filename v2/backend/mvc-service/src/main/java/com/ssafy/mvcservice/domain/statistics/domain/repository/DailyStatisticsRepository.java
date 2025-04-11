package com.ssafy.mvcservice.domain.statistics.domain.repository;

import com.ssafy.mvcservice.domain.account.presentation.dto.response.DailyStatisticsResponse;
import com.ssafy.mvcservice.domain.account.presentation.dto.response.WeekStatisticsResponse;
import com.ssafy.mvcservice.domain.statistics.domain.DailyStatistics;
import com.ssafy.mvcservice.domain.statistics.domain.key.DayId;
import com.ssafy.mvcservice.domain.user.domain.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DailyStatisticsRepository extends JpaRepository<DailyStatistics, DayId> {

    @Query(
        "SELECT NEW com.ssafy.mvcservice.domain.account.presentation.dto.response.DailyStatisticsResponse( "
            +
            "    d.dayId.targetDay, " +
            "    d.totalEarnSum, " +
            "    d.totalConsumeSum " +
            ") " +
            "FROM DailyStatistics d " +
            "WHERE d.dayId.user = :user " +
            "AND d.dayId.targetDay BETWEEN :startDate AND :endDate "
    )
    List<DailyStatisticsResponse> findByUserAndMonth(User user, LocalDate startDate,
        LocalDate endDate);

    @Query(
        "SELECT NEW com.ssafy.mvcservice.domain.account.presentation.dto.response.WeekStatisticsResponse( "
            +
            "    CAST(WEEK(d.dayId.targetDay) - WEEK(:monthFirstDay) AS integer), "
            +
            "    COALESCE(CAST(SUM(d.totalEarnSum) AS Long), 0L), " +
            "    COALESCE(CAST(SUM(d.totalConsumeSum) AS Long), 0L) " +
            ") " +
            "FROM DailyStatistics d " +
            "WHERE d.dayId.user = :user " +
            "AND YEAR(d.dayId.targetDay) = :year " +
            "AND MONTH(d.dayId.targetDay) = :month " +
            "GROUP BY WEEK(d.dayId.targetDay)")
    List<WeekStatisticsResponse> findWeeklyStatistics(
        User user,
        int year,
        int month,
        LocalDate monthFirstDay
    );
}
