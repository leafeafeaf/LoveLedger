package com.ssafy.webfluxservice.domain.library.service;

import com.ssafy.webfluxservice.domain.account.domain.Account;
import com.ssafy.webfluxservice.domain.account.domain.repository.AccountRepository;
import com.ssafy.webfluxservice.domain.history.domain.History;
import com.ssafy.webfluxservice.domain.history.domain.repository.HistoryRepository;
import com.ssafy.webfluxservice.domain.library.domain.Fiction;
import com.ssafy.webfluxservice.domain.library.domain.repository.FictionRepository;
import com.ssafy.webfluxservice.domain.library.domain.repository.SeriesRepository;
import com.ssafy.webfluxservice.domain.library.domain.repository.ThemeRepository;
import com.ssafy.webfluxservice.domain.library.presentation.dto.request.fiction.FictionArtCreateReq;
import com.ssafy.webfluxservice.domain.library.presentation.dto.request.fiction.FictionContentCreateReq;
import com.ssafy.webfluxservice.domain.library.presentation.dto.response.fiction.FictionArtReadRes;
import com.ssafy.webfluxservice.domain.library.presentation.dto.response.fiction.FictionContentReadRes;
import com.ssafy.webfluxservice.domain.user.domain.User;
import com.ssafy.webfluxservice.global.response.exception.ErrorCode;
import com.ssafy.webfluxservice.global.response.exception.LoveLedgerException;
import com.ssafy.webfluxservice.global.webclient.client.GeminiClient;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class FictionService {

    private final SeriesRepository seriesRepository;
    private final ThemeRepository themeRepository;
    private final FictionRepository fictionRepository;
    private final AccountRepository accountRepository;
    private final HistoryRepository historyRepository;
    private final GeminiClient geminiClient;

    public Mono<FictionContentReadRes> getFictionContentAI(User user, Long libraryId,
        FictionContentCreateReq req) {
        Long themeId = req.getThemeId();
        Long seriesId = req.getSeriesId();
        LocalDate startDate = req.getStartDate();
        LocalDate endDate = req.getEndDate();
        Boolean isMarried = user.getIsMarried();
        Boolean gender = user.getGender();

        return seriesRepository.findById(seriesId)
            .switchIfEmpty(Mono.error(
                new LoveLedgerException(ErrorCode.SERIES_NOT_FOUND, seriesId.toString())))
            .flatMap(series -> {
                //시리즈 라이브러리 아이디 확인
                if (!series.getLibraryId().equals(libraryId)) {
                    return Mono.error(new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS));
                }

                return themeRepository.findById(themeId)
                    .switchIfEmpty(Mono.error(
                        new LoveLedgerException(ErrorCode.THEME_NOT_FOUND, themeId.toString())))
                    .flatMap(theme -> {
                        //계좌 리스트 불러오기
                        Flux<String> accountIds = accountRepository.findByUserId(user.getId())
                            .map(Account::getAccountId);

                        return accountIds.collectList().flatMap(ids -> {
                            if (ids.isEmpty()) {
                                return Mono.error(
                                    new LoveLedgerException(ErrorCode.ACCOUNT_NOT_FOUND));
                            }
                            //계좌 리스트 바탕으로 계좌 내역 리스트 불러오기
                            return historyRepository.findByAccountIdInAndCreatedDateBetween(ids,
                                    startDate, endDate)
                                .collectList()
                                .flatMap(histories -> {
                                    if (histories.isEmpty()) {
                                        return Mono.error(
                                            new LoveLedgerException(ErrorCode.HISTORY_NOT_FOUND));
                                    }

                                    return fictionRepository.findTop10BySeriesId(seriesId)
                                        .collectList()
                                        .flatMap(fictions -> {

                                            String prompt = geminiClient.createPromptByTheme(
                                                theme.getName(), startDate,
                                                endDate, formatHistoryList(histories),
                                                formatFictionList(fictions),
                                                gender, isMarried
                                            );
                                            log.info("Prompt: {}", prompt);

                                            return geminiClient.askGemini(prompt,
                                                    "gemini-2.0-flash")
                                                .map(result -> FictionContentReadRes.builder()
                                                    .title((String) result.get("title"))
                                                    .content((String) result.get("content"))
                                                    .build());
                                        });
                                });
                        });
                    });
            });
    }

    public Mono<FictionArtReadRes> getFictionArtAI(FictionArtCreateReq fictionArtCreateReq) {
        String drawStyle = fictionArtCreateReq.getDrawStyle();
        String title = fictionArtCreateReq.getTitle();
        String content = fictionArtCreateReq.getContent();

        String prompt = """
            당신은 그림체, 소설의 제목과 내용에 따라 한 장의 그림을 생성하여 이미지 url로 보여주는 AI 비서입니다.\s
                        
            [입력값]
            - 그림체: %s (그림의 스타일)
            - 제목: %s (소설의 중심 주제를 담고 있는 문장입니다.)
            - 내용: (주요 사건, 인물, 배경이 서술된 본문입니다. 이 내용을 바탕으로 장면을 상상해주세요.)
            %s
                        
            [출력 목적]
            제공된 정보를 바탕으로 하나의 장면을 묘사한 입력받은 그림체로 이미지를 생성하기 위한 구체적인 프롬프트 문장을 만드세요.
                        
            [출력 형식]
            {
              "image_url": "https://~"
            }
                        
            [규칙]
            1. 반드시 소설의 인물을 중심으로 장면을 구성하세요.
            2. 소설의 핵심 갈등, 감정, 또는 상징적인 순간을 시각화하세요.
            3. 테마의 분위기(예: 어두운, 로맨틱한, 환상적인 등)를 반영하여 배경과 색감도 함께 묘사해주세요.
            4. 직접적인 대사보다는 묘사 중심의 프롬프트를 작성해주세요.
            5. 민감하거나 부정적인 표현은 피해주세요.
                        
            [중요 사항]
            1. 반드시 입력값의 그림체에 해당하는 그림체로 귀엽게 만들어주세요.
            2. 반드시 이미지 url로 출력해주세요.
            """.formatted(drawStyle, title, content);

        return geminiClient.askGemini(prompt, "gemini-2.0-flash")
            .map(result -> FictionArtReadRes.builder()
                .imageUrl((String) result.get("image_url"))
                .build());
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

    private String formatFictionList(List<Fiction> fictionList) {
        StringBuilder sb = new StringBuilder();
        sb.append("[\n");
        for (Fiction fiction : fictionList) {
            sb.append(String.format(
                "    {\n" +
                    "        \"title\": \"%s\",\n" +
                    "        \"content\": \"%s\",\n" +
                    "    },\n",
                fiction.getTitle(),
                fiction.getContent()
            ));
        }
        sb.append("]");
        return sb.toString();
    }
}
