package com.ssafy.loveledger.domain.history.service;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.account.domain.repository.AccountRepository;
import com.ssafy.loveledger.domain.history.domain.History;
import com.ssafy.loveledger.domain.history.domain.repository.HistoryRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class HistoryService {

    private final HistoryRepository historyRepository;
    private final AccountRepository accountRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * 사용자 ID와 계좌 ID를 통해 특정 기간의 거래내역을 조회합니다.
     *
     * @param userId 사용자 ID
     * @param accountId 계좌 ID
     * @param startDate 시작 날짜 (yyyy-MM-dd 형식)
     * @param endDate 종료 날짜 (yyyy-MM-dd 형식)
     * @return 거래내역 목록 (Map 형태)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getHistoriesByDateRange(Long userId, String accountId, String startDate, String endDate) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("해당 계좌를 찾을 수 없습니다: " + accountId));

        LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
        LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);

        log.info("거래내역 조회 - 계좌: {}, 기간: {} ~ {}", accountId, startDate, endDate);

        List<History> histories = historyRepository.findByAccountAndCreatedDateBetweenAndIsDeletedFalseOrderByCreatedDateDescCreatedTimeDesc(
            account, start, end);

        log.info("조회된 거래내역 수: {}", histories.size());

        return convertToMapList(histories);
    }

    /**
     * 거래내역 엔티티 목록을 Map 목록으로 변환합니다.
     *
     * @param histories 거래내역 엔티티 목록
     * @return Map 형태의 거래내역 목록
     */
    private List<Map<String, Object>> convertToMapList(List<History> histories) {
        return histories.stream()
            .map(this::convertToMap)
            .collect(Collectors.toList());
    }

    /**
     * 거래내역 엔티티를 Map으로 변환합니다.
     *
     * @param history 거래내역 엔티티
     * @return Map 형태의 거래내역
     */
    private Map<String, Object> convertToMap(History history) {
        Map<String, Object> map = new HashMap<>();
        map.put("transactionId", history.getTransactionId());
        map.put("date", history.getCreatedDate().toString());
        map.put("time", history.getCreatedTime().toString());
        map.put("description", history.getSummary());
        map.put("amount", history.getTransactionAmount());
        map.put("transactionType", history.getTransactionType());
        map.put("transactionTypeName", history.getTransactionTypeName());

        if (history.getCategory() != null) {
            map.put("category", history.getCategory().getName());
        }

        if (history.getTransactionTarget() != null && !history.getTransactionTarget().isEmpty()) {
            map.put("target", history.getTransactionTarget());
        }

        if (history.getMemo() != null && !history.getMemo().isEmpty()) {
            map.put("memo", history.getMemo());
        }

        return map;
    }

//    /**
//     * 카테고리별 지출 합계를 조회합니다.
//     *
//     * @param userId 사용자 ID
//     * @param accountId 계좌 ID
//     * @param startDate 시작 날짜
//     * @param endDate 종료 날짜
//     * @return 카테고리별 합계 목록
//     */
//    @Transactional(readOnly = true)
//    public List<Map<String, Object>> getCategorySummary(Long userId, String accountId, String startDate, String endDate) {
//        Account account = accountRepository.findById(accountId)
//            .orElseThrow(() -> new IllegalArgumentException("해당 계좌를 찾을 수 없습니다: " + accountId));
//
//        if (!account.getMember().getId().equals(userId)) {
//            throw new IllegalArgumentException("해당 계좌에 접근 권한이 없습니다.");
//        }
//
//        LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
//        LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
//
//        List<Object[]> results = historyRepository.findCategorySummaryByAccountAndDateRange(account, start, end);
//
//        return results.stream()
//            .map(result -> {
//                Map<String, Object> map = new HashMap<>();
//                Category category = (Category) result[0];
//                map.put("category", category != null ? category.getName() : "미분류");
//                map.put("totalAmount", result[1]);
//                return map;
//            })
//            .collect(Collectors.toList());
//    }
//
//    /**
//     * 월별 지출 합계를 조회합니다.
//     *
//     * @param userId 사용자 ID
//     * @param accountId 계좌 ID
//     * @return 월별 합계 목록
//     */
//    @Transactional(readOnly = true)
//    public List<Map<String, Object>> getMonthlySummary(Long userId, String accountId) {
//        Account account = accountRepository.findById(accountId)
//            .orElseThrow(() -> new IllegalArgumentException("해당 계좌를 찾을 수 없습니다: " + accountId));
//
//        if (!account.getMember().getId().equals(userId)) {
//            throw new IllegalArgumentException("해당 계좌에 접근 권한이 없습니다.");
//        }
//
//        List<Object[]> results = historyRepository.findMonthlySummaryByAccount(account);
//
//        return results.stream()
//            .map(result -> {
//                Map<String, Object> map = new HashMap<>();
//                Integer year = (Integer) result[0];
//                Integer month = (Integer) result[1];
//                map.put("yearMonth", String.format("%04d-%02d", year, month));
//                map.put("totalAmount", result[2]);
//                return map;
//            })
//            .collect(Collectors.toList());
//    }
//
//    /**
//     * 거래내역을 키워드로 검색합니다.
//     *
//     * @param userId 사용자 ID
//     * @param accountId 계좌 ID
//     * @param keyword 검색 키워드
//     * @return 검색된 거래내역 목록
//     */
//    @Transactional(readOnly = true)
//    public List<Map<String, Object>> searchHistories(Long userId, String accountId, String keyword) {
//        Account account = accountRepository.findById(accountId)
//            .orElseThrow(() -> new IllegalArgumentException("해당 계좌를 찾을 수 없습니다: " + accountId));
//
//        if (!account.getMember().getId().equals(userId)) {
//            throw new IllegalArgumentException("해당 계좌에 접근 권한이 없습니다.");
//        }
//
//        List<History> histories = historyRepository.searchHistories(account, keyword);
//
//        return convertToMapList(histories);
//    }
}

