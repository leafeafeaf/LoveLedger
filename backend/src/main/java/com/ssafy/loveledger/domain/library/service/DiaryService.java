package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.history.domain.History;
import com.ssafy.loveledger.domain.history.domain.repository.HistoryRepository;
import com.ssafy.loveledger.domain.library.domain.Diary;
import com.ssafy.loveledger.domain.library.domain.repository.DiaryRepository;
import com.ssafy.loveledger.domain.library.presentation.dto.request.DiaryCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.DiaryUpdateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.UpdateHistoryRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.response.DiaryReadAllResponse;
import com.ssafy.loveledger.domain.library.presentation.dto.response.DiaryReadResponse;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.openai.util.OpenAiUtil;
import jakarta.validation.Valid;
import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.CompletableFuture;
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
    private final OpenAiUtil openAiUtil;

    //TODO 전역 에러 처리 및 에러 메시지 표준화 필요
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

    public Page<DiaryReadAllResponse> readAllDiary(User user, int pageno, int size, String sort) {
        // 정렬 방식 결정 (DESC 기본값)
        Sort.Direction direction =
            sort.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Pageable 객체 생성 (페이지 번호는 0부터 시작해야 하므로 pageno - 1)
        Pageable pageable = PageRequest.of(pageno - 1, size, Sort.by(direction, "createdAt"));

        // 페이징 처리된 결과 반환
        return diaryRepository.findByLibrary(user.getLibrary(), pageable);
    }

    //TODO 전역 에러 처리 및 에러 메시지 표준화 필요
    public DiaryReadResponse readDiary(User user, long diaryId) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new NoSuchElementException("해당 일기 (ID: " + diaryId + ")를 찾을 수 없습니다."));

        //유저 서재인지 확인
        if (!diary.getLibrary().getId().equals(user.getLibrary().getId())) {
            try {
                throw new AccessDeniedException("해당 일기에 대한 접근 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        return DiaryReadResponse.builder()
            .title(diary.getTitle())
            .content(diary.getContent())
            .targetDate(diary.getTargetDate())
            .createdAt(diary.getCreatedAt())
            .updatedAt(diary.getUpdatedAt())
            .build();
    }

    //TODO 전역 에러 처리 및 에러 메시지 표준화 필요
    public void updateDiary(User user, long diaryId, @Valid DiaryUpdateRequest diaryUpdateRequest) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new NoSuchElementException("해당 일기 (ID: " + diaryId + ")를 찾을 수 없습니다."));

        //유저 서재인지 확인
        if (!diary.getLibrary().getId().equals(user.getLibrary().getId())) {
            try {
                throw new AccessDeniedException("해당 일기에 대한 접근 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        //수정
        diary.setTitle(diaryUpdateRequest.getTitle());
        diary.setContent(diaryUpdateRequest.getContent());

        diaryRepository.save(diary);
    }

    //TODO 전역 에러 처리 및 에러 메시지 표준화 필요
    public void deleteDiary(User user, long diaryId) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new NoSuchElementException("해당 일기 (ID: " + diaryId + ")를 찾을 수 없습니다."));

        //유저 서재인지 확인
        if (!diary.getLibrary().getId().equals(user.getLibrary().getId())) {
            try {
                throw new AccessDeniedException("해당 일기에 대한 접근 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        diaryRepository.delete(diary);
    }


    public CompletableFuture<Map<String, Object>> getEditHistoryList(User user, long diaryId) {
        //일기가 있는지 확인
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new NoSuchElementException("해당 일기 (ID: " + diaryId + ")를 찾을 수 없습니다."));

        //유저 일기인지 확인 TODO 예외 처리 공통화
        if (!diary.getLibrary().getId().equals(user.getLibrary().getId())) {
            try {
                throw new AccessDeniedException("해당 일기에 대한 접근 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }
        //일기 일자 빼내기
        LocalDate targetDate = diary.getTargetDate();

        log.info(targetDate + " 대상일자");

        //유저 계좌 불러오기 TODO 수정 필요
        Account account = Account.builder().accountId("1").build();
        //해당 일자의 계좌 내역 불러오기 TODO 계좌기반 검색 추가
        List<History> historyList = historyRepository.findByCreatedDate(targetDate);
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
            
            ### [사용자의 일기 내용]
            %s
            
            ### [해당 날짜의 금융 거래 내역]
            %s
            
            ### [출력 형식 예시]
            {
                "history": [
                    {
                        "transactionId": "TXN001",
                        "time": "2025-03-20T08:15:00",
                        "remittance": true,
                        "targetname": "스타벅스 시흥점",
                        "updatedTargetName": "스타벅스에서 커피 한잔",
                        "category_id": 2,
                        "afterAmount": 988000,
                        "amount": 12000
                    },
                    {
                        "transactionId": "TXN005",
                        "time": "2025-03-20T18:20:00",
                        "remittance": true,
                        "targetname": "우리집감자탕",
                        "updatedTargetName": "친구와 감자탕",
                        "category_id": 5,
                        "afterAmount": 855000,
                        "amount": 43000
                    },
                    {
                        "transactionId": "TXN010",
                        "time": "2025-03-20T23:30:00",
                        "remittance": true,
                        "targetname": "Subscription10",
                        "updatedTargetName": "택시",
                        "category_id": 9,
                        "afterAmount": 673000,
                        "amount": 20000
                    }
                ]
            }
            """.formatted(diary.getContent(), formatHistoryList(historyList));

//        log.info(prompt);
//        return null;

        return openAiUtil.askChatGpt(prompt)
            .thenApply(openAiUtil::mapResponseToMap);
    }


    //트랜잭션 하나라도 실패하면 전부 롤백
    @Transactional
    public void editHistory(User user, UpdateHistoryRequest updateHistoryRequest) {
        //TODO 예외 처리
        List<String> transactionIds = updateHistoryRequest.getTransactionId();
        List<String> updatedTargetNames = updateHistoryRequest.getUpdatedTargetNames();
        String accountId = updateHistoryRequest.getAccountId();

        if (transactionIds.size() != updatedTargetNames.size()) {
            try {
                throw new IllegalArgumentException(
                    "Transaction IDs and Target Names must have the same size.");
            } catch (IllegalArgumentException e) {
                throw new RuntimeException(e);
            }
        }

        //transactionIds을 모두 돌면서
        //historyRepository에서 히스토리 객체를 불러와서 targetName을 수정하고 저장
        //이때 히스토리 객체의 accountId가 현재 accountId와 같지않으면 예외처리
        for (int i = 0; i < transactionIds.size(); i++) {
            String transactionId = transactionIds.get(i);
            String updatedTargetName = updatedTargetNames.get(i);

            // 트랜잭션 ID를 통해 히스토리 객체 가져오기
            History history = historyRepository.findById(transactionId)
                .orElseThrow(
                    () -> new IllegalArgumentException("Transaction not found: " + transactionId));

            // 해당 히스토리의 accountId가 요청된 accountId와 일치하는지 확인
            if (!history.getAccount().getAccountId().equals(accountId)) {
                throw new RuntimeException();
            }

            // targetName 업데이트
            history.updateTargetName(updatedTargetName);

            // 저장
            historyRepository.save(history);
        }
    }

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
                    "        \"category_id\": %d,\n" +
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
                history.getCategoryId(),
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
