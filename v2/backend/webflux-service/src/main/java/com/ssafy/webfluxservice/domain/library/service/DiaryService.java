package com.ssafy.webfluxservice.domain.library.service;

import com.ssafy.webfluxservice.domain.account.domain.Account;
import com.ssafy.webfluxservice.domain.account.domain.repository.AccountRepository;
import com.ssafy.webfluxservice.domain.history.domain.History;
import com.ssafy.webfluxservice.domain.history.domain.repository.HistoryRepository;
import com.ssafy.webfluxservice.domain.library.domain.Diary;
import com.ssafy.webfluxservice.domain.library.domain.repository.DiaryRepository;
import com.ssafy.webfluxservice.domain.user.domain.User;
import com.ssafy.webfluxservice.global.response.exception.ErrorCode;
import com.ssafy.webfluxservice.global.response.exception.LoveLedgerException;
import com.ssafy.webfluxservice.global.webclient.client.GeminiClient;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final HistoryRepository historyRepository;
    private final AccountRepository accountRepository;
    private final GeminiClient geminiClient;

    public Mono<Map<String, Object>> getEditHistoryList(User user, Long libraryId, long diaryId) {
        return diaryRepository.findById(diaryId)
            .switchIfEmpty(Mono.error(
                new LoveLedgerException(ErrorCode.DIARY_NOT_FOUND, String.valueOf(diaryId))))
            .flatMap((Diary diary) -> {
                // 권한 체크
                if (!diary.getLibraryId().equals(libraryId)) {
                    return Mono.error(new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS));
                }

                return getAccountIds(user.getId())
                    .flatMap(accountIds -> getHistoriesOrError(accountIds, diary.getTargetDate())
                        .flatMap(histories -> {
                            log.info(histories.size() + " 내역 개수");

                            String prompt = buildPrompt(diary.getContent(), histories);
                            return geminiClient.askGemini(prompt, "gemini-2.0-flash");
                        }));
            });
    }

    private Mono<List<String>> getAccountIds(Long userId) {
        return accountRepository.findByUserId(userId)
            .map(Account::getAccountId)
            .collectList()
            .flatMap(accountIds -> {
                if (accountIds.isEmpty()) {
                    return Mono.error(new LoveLedgerException(ErrorCode.ACCOUNT_NOT_FOUND));
                }
                return Mono.just(accountIds);
            });
    }

    private Mono<List<History>> getHistoriesOrError(List<String> accountIds, LocalDate date) {
        return Flux.fromIterable(accountIds)
            .flatMap(accountId -> historyRepository.findByAccountIdAndCreatedDate(accountId, date))
            .collectList();
    }

    private String buildPrompt(String diaryContent, List<History> histories) {
        String formattedHistory = histories.stream()
            .map(h -> "- " + h.getCreatedTime() + " / " + h.getTransactionTarget() + " / "
                + h.getTransactionAmount() + "원")
            .collect(Collectors.joining("\n"));

        return """
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
                        
                        
            """.formatted(diaryContent, formattedHistory);
    }
}
