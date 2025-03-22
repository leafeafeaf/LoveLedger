package com.ssafy.loveledger.domain.history.domain.repository;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.history.domain.History;
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

    @Query("SELECT h FROM History h WHERE h.account IN :accounts AND h.createdDate = :targetDate")
    List<History> findByAccountsAndCreatedDate(@Param("accounts") List<Account> accounts,
        @Param("targetDate") LocalDate targetDate);

}
