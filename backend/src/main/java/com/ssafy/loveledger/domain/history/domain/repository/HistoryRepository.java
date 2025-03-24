package com.ssafy.loveledger.domain.history.domain.repository;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.account.presentation.dto.response.DailyStatisticsResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.WeekStatisticsResponse;
import com.ssafy.loveledger.domain.history.domain.History;
import com.ssafy.loveledger.domain.user.domain.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface HistoryRepository extends JpaRepository<History, String> {

    Page<History> findByAccountAndCreatedDate(Account account, LocalDate createdDate,
        Pageable pageable);

    @Query(
        "SELECT NEW com.ssafy.loveledger.domain.account.presentation.dto.response.DailyStatisticsResponse( "
            +
            "    d.dayId.targetDay, " +
            "    COALESCE(CAST(SUM(d.totalEarnSum) AS Long), 0L), " +
            "    COALESCE(CAST(SUM(d.totalConsumeSum) AS Long), 0L) " +
            ") " +
            "FROM DailyStatistics d " +
            "WHERE d.dayId.user = :user " +
            "AND d.dayId.targetDay BETWEEN :startDate AND :endDate " +
            "GROUP BY d.dayId.targetDay " +
            "ORDER BY d.dayId.targetDay ASC"
    )
    List<DailyStatisticsResponse> findByUserAndMonth(User user, LocalDate startDate,
        LocalDate endDate, Pageable pageable);

    @Query(
        "SELECT NEW com.ssafy.loveledger.domain.account.presentation.dto.response.WeekStatisticsResponse( "
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

    // 페이징 없이 전체 리스트 반환하는 거래 내역 조회
    List<History> findByAccountAndCreatedDate(Account account, LocalDate createdDate);

    List<History> findByCreatedDate(LocalDate targetDate);
}
