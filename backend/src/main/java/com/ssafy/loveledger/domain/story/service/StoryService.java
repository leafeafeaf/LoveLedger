package com.ssafy.loveledger.domain.story.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.history.service.HistoryService;
import com.ssafy.loveledger.domain.story.presentation.dto.QueryRequest;
import com.ssafy.loveledger.domain.story.presentation.dto.StoryData;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import com.ssafy.loveledger.global.util.StoryGeneratorClient;
import com.ssafy.loveledger.global.util.UserUtil;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryGeneratorClient storyGeneratorClient;
    private final HistoryService historyService;
    private final UserUtil userUtil;
    private final ObjectMapper objectMapper;


    /**
     * 사용자의 소비내역을 기반으로 소설을 생성합니다.
     *
     * @param query     밈 검색 키워드
     * @param startDate 시작 날짜
     * @param endDate   종료 날성짜
     * @param theme     테마
     * @return 생성된 소설 응답 (제목과 내용만 포함)
     */
    public StoryData generateStory(
        String query,
        String startDate,
        String endDate,
        String theme) {

//        try {
//            // 입력값 검증
//            validateInputs(query, startDate, endDate, theme);

        // UserUtil을 통해 현재 로그인한 사용자 정보 가져오기
        User user = userUtil.getCurrentUser();
        Long userId = user.getId();

        // 사용자의 계좌 정보 확인 (1대1 매핑이므로 첫 번째 계좌 사용)
        if (user.getAccount() == null || user.getAccount().isEmpty()) {
            throw new LoveLedgerException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        Account account = user.getAccount().get(0);
        String accountId = account.getAccountId();

        log.info("소설 생성 요청 - 사용자: {}, 계좌: {}, 쿼리: {}, 기간: {} ~ {}",
            userId, accountId, query, startDate, endDate);

        // 성별 정보 변환 (Boolean -> String)
        String gender = user.getGender() != null && user.getGender() ? "남성" : "여성";
        boolean maritalStatus = user.getIsMarried() != null && user.getIsMarried();

        // HistoryService를 통해 사용자의 거래내역 조회
        List<Map<String, Object>> transactions = historyService.getHistoriesByDateRange(
            userId, accountId, startDate, endDate);

        if (transactions.isEmpty()) {
            log.warn("해당 기간 내 소비내역이 없습니다.");
            return StoryData.builder()
                .title("소비내역 없음")
                .content("선택하신 기간 동안의 소비내역이 없습니다. 다른 기간을 선택해주세요.")
                .build();
        }

        log.info("소비내역 조회 완료 - 총 {}건", transactions.size());

        // 날짜 범위 Map 생성
        Map<String, String> dateRange = new HashMap<>();
        dateRange.put("start_date", startDate);
        dateRange.put("end_date", endDate);

        // FastAPI 요청 객체 생성
        QueryRequest request = QueryRequest.builder()
            .query(query)
            .transactions(transactions)
            .dateRange(dateRange)
            .gender(gender)
            .maritalStatus(maritalStatus)
            .theme(theme)
            .previousStory("") // 이전 스토리가 있는 경우 여기에 추가
            .build();

        log.info("FastAPI 요청 시작 - 쿼리: {}, 거래내역 수: {}", query, transactions.size());

        try {
            // FastAPI 호출 - 이제 StoryData(title, content만 포함)를 바로 반환받음
            StoryData storyData = storyGeneratorClient.generateStory(request);

            // 응답 로깅
            log.debug("FastAPI 응답: {}", storyData);

            // 응답 검증 및 반환
            if (storyData != null) {
                log.info("소설 생성 완료 - 제목: {}", storyData.getTitle());
                return storyData;
            } else {
                log.warn("FastAPI 응답이 null입니다");
                return new StoryData("응답 없음", "FastAPI 서버에서 응답을 받지 못했습니다.");
            }
        } catch (Exception e) {
            log.error("FastAPI 호출 중 오류 발생", e);
            throw new LoveLedgerException(ErrorCode.OPENFEIGN_FAILED);
        }
    }
}

