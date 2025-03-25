package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.history.domain.History;
import com.ssafy.loveledger.domain.history.domain.repository.HistoryRepository;
import com.ssafy.loveledger.domain.library.domain.Diary;
import com.ssafy.loveledger.domain.library.domain.repository.DiaryRepository;
import com.ssafy.loveledger.domain.library.presentation.dto.request.diary.DiaryCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.diary.DiaryUpdateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.diary.UpdateHistoryRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.response.diary.DiaryReadAllResponse;
import com.ssafy.loveledger.domain.library.presentation.dto.response.diary.DiaryReadResponse;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import com.ssafy.loveledger.global.util.GeminiUtil;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final HistoryRepository historyRepository;
    private final GeminiUtil geminiUtil;

    @Transactional
    public void createDiary(User user, @Valid DiaryCreateRequest diaryCreateRequest) {
        //Diary 생성
        Diary diary = Diary.builder()
            .library(user.getLibrary())
            .targetDate(diaryCreateRequest.getTargetDate())
            .title(diaryCreateRequest.getTitle())
            .content(diaryCreateRequest.getContent())
            .build();

        //일기 저장
        diaryRepository.save(diary);
    }

    @Transactional(readOnly = true)
    public Page<DiaryReadAllResponse> readAllDiary(User user, int pageno, int size,
        String sort) {
        // 정렬 방식 결정 (DESC 기본값)
        Sort.Direction direction =
            sort.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Pageable 객체 생성 (페이지 번호는 0부터 시작해야 하므로 pageno - 1)
        Pageable pageable = PageRequest.of(pageno - 1, size, Sort.by(direction, "createdAt"));

        // 페이징 처리된 결과 반환
        return diaryRepository.findByLibrary(user.getLibrary(), pageable);
    }

    @Transactional(readOnly = true)
    public DiaryReadResponse readDiary(User user, long diaryId) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.DIARY_NOT_FOUND, String.valueOf(diaryId)));

        //유저 서재인지 확인
        if (!diary.getLibrary().equals(user.getLibrary())) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        return DiaryReadResponse.builder()
            .title(diary.getTitle())
            .content(diary.getContent())
            .targetDate(diary.getTargetDate())
            .createdAt(diary.getCreatedAt())
            .updatedAt(diary.getUpdatedAt())
            .build();
    }

    @Transactional
    public void updateDiary(User user, long diaryId,
        @Valid DiaryUpdateRequest diaryUpdateRequest) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.DIARY_NOT_FOUND, String.valueOf(diaryId)));

        //유저 서재인지 확인
        if (!diary.getLibrary().equals(user.getLibrary())) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        //수정
        diary.setTitle(diaryUpdateRequest.getTitle());
        diary.setContent(diaryUpdateRequest.getContent());

        diaryRepository.save(diary);
    }

    @Transactional
    public void deleteDiary(User user, long diaryId) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.DIARY_NOT_FOUND, String.valueOf(diaryId)));

        //유저 서재인지 확인
        if (!diary.getLibrary().equals(user.getLibrary())) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        diaryRepository.delete(diary);
    }

    @Transactional(readOnly = true)
    public CompletableFuture<Map<String, Object>> getEditHistoryList(User user,
        long diaryId) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.DIARY_NOT_FOUND, String.valueOf(diaryId)));

        //유저 서재인지 확인
        if (!diary.getLibrary().equals(user.getLibrary())) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        //일기 일자 빼내기
        LocalDate targetDate = diary.getTargetDate();

        log.info("대상일자 : {}", targetDate);

        //계좌 불러오기
        List<Account> accounts = user.getAccount();

        if (accounts == null || accounts.isEmpty()) {
            throw new LoveLedgerException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        //해당 일자의 계좌 내역 불러오기
        List<History> histories = historyRepository.findByAccountsAndCreatedDate(accounts,
            targetDate);

        if (histories == null || histories.isEmpty()) {
            throw new LoveLedgerException(ErrorCode.HISTORY_NOT_FOUND);
        }

        log.info("계좌 개수 : {}  내역 개수 : {}", accounts.size(), histories.size());

        //챗지피티 반환
        String prompt = """
            당신은 사용자의 소비 기록을 분석하는 AI 비서입니다.
            사용자가 기록한 일기와 같은 날짜의 금융 거래 내역을 참고하여, 거래의 목적과 관련된 `transaction_target` 값을 적절히 수정해주세요.
            
            **규칙**
            1. 일기 내용과 거래 내역을 비교하여, 일기에서 특정 거래와 관련된 내용이 확인되면 `transaction_target`을 수정합니다.
            2. 필수적으로 모든 거래를 수정할 필요는 없습니다.
            3. 변경이 필요할 경우 `updatedTargetName` 필드를 추가하고, `remittance` 값을 `true`로 설정해야 합니다.
            4. 수정이 필요 없는 경우 `updatedTargetName`은 `null`로 설정합니다.
            5. 무조건 JSON형식만 반환한다. 다른 텍스트는 일절 넣지 않는다.
            
            ### [입력 형식 예시]
            1. 일기
            맥도날드에서 혼자서 햄버거를 먹었다. 꽤나 맛없었다.
            저녁에는 친구와 감자탕을 먹었다.
            집에 오는길에는 택시를 타고 집에 들어왔다.
            
            2. 계좌 내역
            
            
            ### [출력 형식 예시]
            {
                "history": [
                    {
                        "transactionId": "TXN001",
                        "time": "2024-03-20T08:15:00",
                        "remittance": true,
                        "targetname": "맥도날드(은계점)",
                        "updatedTargetName": "맥도날드에서 맛없는 햄버거 먹기",
                        "category_id": 2,
                        "afterAmount": 988000,
                        "amount": 12000
                    },
                    {
                        "transactionId": "TXN005",
                        "time": "2024-03-20T18:20:00",
                        "remittance": true,
                        "targetname": "우리집감자탕",
                        "updatedTargetName": "친구와 감자탕",
                        "category_id": 5,
                        "afterAmount": 855000,
                        "amount": 43000
                    },
                    {
                        "transactionId": "TXN010",
                        "time": "2024-03-20T23:30:00",
                        "remittance": true,
                        "targetname": "Subscription10",
                        "updatedTargetName": "택시",
                        "category_id": 9,
                        "afterAmount": 673000,
                        "amount": 20000
                    }
                ]
            }
            
            ### [사용자의 일기 내용]
            %s
            
            ### [해당 날짜의 금융 거래 내역]
            %s
            
            
            """.formatted(diary.getContent(), formatHistoryList(histories));

//        return openAiUtil.askChatGpt(prompt)
//            .thenApply(openAiUtil::mapResponseToMap);
        return geminiUtil.askGemini(prompt)
            .thenApply(geminiUtil::mapResponseToMap);
    }


    //트랜잭션 하나라도 실패하면 전부 롤백
    @Transactional
    public void editHistory(User user, UpdateHistoryRequest updateHistoryRequest) {

        List<String> transactionIds = updateHistoryRequest.getTransactionId();
        List<String> updatedTargetNames = updateHistoryRequest.getUpdatedTargetNames();

        //개수 비교
        if (transactionIds.size() != updatedTargetNames.size()) {
            throw new LoveLedgerException(ErrorCode.TRANSACTION_SIZE_MISMATCH);
        }
        //계좌 불러오기
        List<Account> accounts = user.getAccount();

        if (accounts == null || accounts.isEmpty()) {
            throw new LoveLedgerException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        Set<String> accountIds = accounts.stream()
            .map(Account::getAccountId)
            .collect(Collectors.toSet());

        //히스토리를 한 번에 조회하여 DB 조회 횟수 최적화 (N+1 문제 방지)
        List<History> histories = historyRepository.findAllById(transactionIds);

        if (histories.size() != transactionIds.size()) {
            throw new LoveLedgerException(ErrorCode.HISTORY_NOT_FOUND);
        }

        histories.forEach(history -> {
            if (!accountIds.contains(history.getAccount().getAccountId())) {
                throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
            }
        });

        // 7. targetName을 변경 (JPA Dirty Checking 활용)
        for (int i = 0; i < histories.size(); i++) {
            histories.get(i).updateTargetName(updatedTargetNames.get(i));
        }

        // 8. saveAll()을 사용하여 한 번에 저장 (JPA Dirty Checking으로 자동 업데이트)
        historyRepository.saveAll(histories);
    }

    //TODO chatGPT이 대체될경우 삭제할것
    private String formatHistoryList(List<History> historyList) {
        StringBuilder sb = new StringBuilder();
        sb.append("[\n");
        for (History history : historyList) {
            sb.append(String.format(
                "    {\n" +
                    "        \"transactionId\": \"%s\",\n" +
                    "        \"time\": \"%sT%s\",\n" +
                    "        \"remittance\": %s,\n" +
                    "        \"targetname\": \"%s\",\n" +
                    "        \"category_id\": %s,\n" +
                    "        \"afterAmount\": %d,\n" +
                    "        \"amount\": %d,\n" +
                    "        \"memo\": \"%s\",\n" +
                    "        \"transactionTypeName\": \"%s\",\n" +
                    "        \"summary\": \"%s\"\n" +
                    "    },\n",
                history.getTransactionId(),
                history.getCreatedDate(),
                history.getCreatedTime(),
                history.getTransactionType() == 1 ? "true" : "false",
                history.getTransactionTarget(),
                history.getCategory(),
                history.getAmountAfterTransaction(),
                history.getTransactionAmount(),
                history.getMemo(),
                history.getTransactionTypeName(),
                history.getSummary()
            ));
        }
        sb.append("]");
        return sb.toString();
    }

}
