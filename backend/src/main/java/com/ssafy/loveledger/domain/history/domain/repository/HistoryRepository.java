package com.ssafy.loveledger.domain.history.domain.repository;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.account.presentation.dto.response.MonthlyStatisticsResponse;
import com.ssafy.loveledger.domain.history.domain.History;
import com.ssafy.loveledger.domain.statistics.domain.Category;
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
        "SELECT NEW com.ssafy.loveledger.domain.account.presentation.dto.response.MonthlyStatisticsResponse( "
            + "   d.category , " +
            "   SUM(CASE WHEN d.transactionType > 2 THEN d.transactionAmount ELSE 0 END), "
            +
            "   SUM(CASE WHEN d.transactionType < 3 THEN d.transactionAmount ELSE 0 END) "
            +
            ") " +
            "FROM History d " +
            "WHERE d.account.user = :user " +
            "AND YEAR(d.createdDate) = :year " +
            "AND MONTH(d.createdDate) = :month " +
            "GROUP BY d.category "
    )
    List<MonthlyStatisticsResponse> findMonthlyStatistics(
        User user,
        int year,
        int month
    );

    @Query("SELECT h FROM History h WHERE h.account IN :accounts AND h.createdDate = :targetDate")
    List<History> findByAccountsAndCreatedDate(@Param("accounts") List<Account> accounts,
        @Param("targetDate") LocalDate targetDate);

    @Query("SELECT h FROM History h WHERE h.account IN :accounts AND h.createdDate BETWEEN :startDate AND :endDate")
    List<History> findByAccountsAndCreatedDateBetween(
        @Param("accounts") List<Account> accounts,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * 계좌 ID와 날짜 범위로 거래내역을 조회합니다.
     *
     * @param account 계좌 객체
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 거래내역 목록
     */
    List<History> findByAccountAndCreatedDateBetweenAndIsDeletedFalseOrderByCreatedDateDescCreatedTimeDesc(
        Account account, LocalDate startDate, LocalDate endDate);
}
