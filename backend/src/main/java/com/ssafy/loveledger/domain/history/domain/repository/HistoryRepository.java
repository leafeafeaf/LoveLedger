package com.ssafy.loveledger.domain.history.domain.repository;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.history.domain.History;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoryRepository extends JpaRepository<History, String> {

    Page<History> findByAccountAndCreatedDate(Account account, LocalDate createdDate,
        Pageable pageable);

    // 페이징 없이 전체 리스트 반환하는 거래 내역 조회
    List<History> findByAccountAndCreatedDate(Account account, LocalDate createdDate);

    List<History> findByCreatedDate(LocalDate targetDate);
}
