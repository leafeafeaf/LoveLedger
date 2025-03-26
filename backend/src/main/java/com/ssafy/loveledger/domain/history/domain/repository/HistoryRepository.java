package com.ssafy.loveledger.domain.history.domain.repository;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.account.presentation.dto.response.DailyStatisticsResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.MonthlyStatisticsResponse;
import com.ssafy.loveledger.domain.account.presentation.dto.response.WeekStatisticsResponse;
import com.ssafy.loveledger.domain.history.domain.History;
import com.ssafy.loveledger.domain.user.domain.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
            "GROUP BY d.dayId.targetDay "
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

    @Query(
        "SELECT NEW com.ssafy.loveledger.domain.account.presentation.dto.response.MonthlyStatisticsResponse( "
            + "   d.category, " +
            "   SUM(CASE WHEN d.transactionType > 2 THEN d.transactionAmount ELSE 0 END), "
            +
            "   SUM(CASE WHEN d.transactionType < 3 THEN d.transactionAmount ELSE 0 END) "
            +
            ") " +
            "FROM History d " +
            "WHERE d.account.user = :user " +
            "AND YEAR(d.createdDate) = :year " +
            "AND MONTH(d.createdDate) = :month " +
            "GROUP BY d.category"
    )
    List<MonthlyStatisticsResponse> findMonthlyStatistics(
        User user,
        int year,
        int month
    );

    @Query("SELECT h FROM History h WHERE h.account IN :accounts AND h.createdDate = :targetDate")
    List<History> findByAccountsAndCreatedDate(@Param("accounts") List<Account> accounts,
        @Param("targetDate") LocalDate targetDate);
}
