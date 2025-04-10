package com.ssafy.mvcservice.domain.library.service;

import com.ssafy.mvcservice.domain.account.domain.Account;
import com.ssafy.mvcservice.domain.history.domain.History;
import com.ssafy.mvcservice.domain.history.domain.repository.HistoryRepository;
import com.ssafy.mvcservice.domain.library.domain.Fiction;
import com.ssafy.mvcservice.domain.library.domain.Series;
import com.ssafy.mvcservice.domain.library.domain.Theme;
import com.ssafy.mvcservice.domain.library.domain.repository.FictionRepository;
import com.ssafy.mvcservice.domain.library.domain.repository.LibraryRepository;
import com.ssafy.mvcservice.domain.library.domain.repository.SeriesRepository;
import com.ssafy.mvcservice.domain.library.domain.repository.ThemeRepository;
import com.ssafy.mvcservice.domain.library.presentation.dto.request.fiction.FictionAllCreateRequest;
import com.ssafy.mvcservice.domain.library.presentation.dto.request.fiction.FictionArtCreateReq;
import com.ssafy.mvcservice.domain.library.presentation.dto.request.fiction.FictionContentCreateReq;
import com.ssafy.mvcservice.domain.library.presentation.dto.request.fiction.FictionReadRequest;
import com.ssafy.mvcservice.domain.library.presentation.dto.response.fiction.FictionAllReadResponse;
import com.ssafy.mvcservice.domain.library.presentation.dto.response.fiction.FictionArtReadRes;
import com.ssafy.mvcservice.domain.library.presentation.dto.response.fiction.FictionContentReadRes;
import com.ssafy.mvcservice.domain.library.presentation.dto.response.fiction.FictionDetailReadResponse;
import com.ssafy.mvcservice.domain.library.presentation.dto.response.fiction.FictionReadResponse;
import com.ssafy.mvcservice.domain.user.domain.User;
import com.ssafy.mvcservice.global.response.exception.ErrorCode;
import com.ssafy.mvcservice.global.response.exception.LoveLedgerException;
import com.ssafy.mvcservice.global.util.GeminiUtil;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
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
public class FictionService {

    private final ThemeRepository themeRepository;
    private final FictionRepository fictionRepository;
    private final SeriesRepository seriesRepository;
    private final LibraryRepository libraryRepository;
    private final HistoryRepository historyRepository;
    private final GeminiUtil geminiUtil;

    // 소설 생성
    @Transactional
    public void createFiction(FictionAllCreateRequest fictionCreateReq) {

        Fiction fiction = Fiction.builder()
            .series(Series.builder().id(fictionCreateReq.getSereisId()).build())
            .Title(fictionCreateReq.getTitle())
            .artURL(fictionCreateReq.getImageUrl())
            .content(fictionCreateReq.getContent())
            .startDate(fictionCreateReq.getStartDate())
            .endDate(fictionCreateReq.getEndDate())
            .build();

        fictionRepository.save(fiction);

    }

    // 소설 삭제
    @Transactional
    public void deleteSeries(User user, Long fictionId) {

        // 소설 Id로 소설 존재 여부 확인
        Fiction fiction = fictionRepository.findById(fictionId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.SERIES_NOT_FOUND, String.valueOf(fictionId)));

        if (!fiction.getSeries().getLibrary().getId().equals(user.getLibrary().getId())) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        fictionRepository.deleteById(fictionId);
    }

    // 시리즈별 소설 전부 조회
    @Transactional
    public Page<FictionAllReadResponse> readAllFiction(User user, int pageNo, int size,
        String sort) {

        // 사용자 체크
        libraryRepository.findById(user.getLibrary().getId()).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS));

        // 정렬 방식 설정
        Sort.Direction direction =
            sort.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Pageable 객체 생성 (페이지 번호는 0부터 시작해야 하므로 pageno - 1)
        Pageable pageable = PageRequest.of(pageNo - 1, size, Sort.by(direction, "id"));

        Page<Series> seriesPage = seriesRepository.findByLibraryId(user.getLibrary().getId(),
            pageable);

        return seriesPage.map(series -> {
            List<FictionReadResponse> fictionDtos = series.getFiction().stream()
                .map(fiction -> FictionReadResponse.builder()
                    .fictionId(fiction.getId())
                    .title(fiction.getTitle())
                    .artUrl(fiction.getArtURL())
                    .createdAt(fiction.getCreatedAt())
                    .build())
                .toList();

            return FictionAllReadResponse.builder()
                .seriesId(series.getId())
                .seriesName(series.getTitle())
                .fictions(fictionDtos)
                .build();
        });
    }

    // 소설 상세 조회
    @Transactional
    public FictionDetailReadResponse readFiction(User user, Long fictionId) {

        // 소설 여부 체크
        Fiction fiction = fictionRepository.findById(fictionId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.FICTION_NOT_FOUND, String.valueOf(fictionId)));

        if (!fiction.getSeries().getLibrary().equals(user.getLibrary())) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }
        return FictionDetailReadResponse.builder()
            .title(fiction.getTitle())
            .content(fiction.getContent())
            .artUrl(fiction.getArtURL())
            .createdAt(fiction.getCreatedAt())
            .build();
    }

    // AI 소설 생성.
    @Transactional(readOnly = true)
    public FictionContentReadRes getFictionContentAI(User user,
        FictionContentCreateReq fictionContentCreateReq) {

        Long themeId = fictionContentCreateReq.getThemeId();
        Long seriesId = fictionContentCreateReq.getSeriesId();
        LocalDate startDate = fictionContentCreateReq.getStartDate();
        LocalDate endDate = fictionContentCreateReq.getEndDate();
        Boolean isMarried = user.getIsMarried();
        Boolean gender = user.getGender();

        // series 있는지 확인
        Series series = seriesRepository.findById(seriesId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.SERIES_NOT_FOUND,
                String.valueOf(seriesId)));

        // 유저 시리즈인지 확인
        if (!series.getLibrary().equals(user.getLibrary())) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        // Theme 검증
        Theme theme = themeRepository.findById(themeId)
            .orElseThrow(
                () -> new LoveLedgerException(ErrorCode.THEME_NOT_FOUND, String.valueOf(themeId)));

        // 최근 10개의 소설 불러오기
        Pageable topTen = PageRequest.of(0, 10);
        List<FictionReadRequest> fictionList = fictionRepository.findTop10BySeriesId(seriesId,
            topTen);

        // 계좌 불러오기
        List<Account> accounts = user.getAccount();

        if (accounts == null || accounts.isEmpty()) {
            throw new LoveLedgerException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        // 해당 일자의 계좌 내역 불러오기
        List<History> histories = historyRepository.findByAccountsAndCreatedDateBetween(
            accounts, startDate, endDate
        );

        if (histories == null || histories.isEmpty()) {
            throw new LoveLedgerException(ErrorCode.HISTORY_NOT_FOUND);
        }

        log.info("계좌 개수 : {}  내역 개수 : {}", accounts.size(), histories.size());

        //TODO : Util로 연결 시, 테마별로 프롬프트 만들기
        String prompt = """
            당신은 사용자의 금융 거래 내역을 바탕으로 테마 스타일에 따라 소설의 제목(title)과 내용(content)을 생성하는 AI 비서입니다.
                        
            [입력값]
            - 테마: %s
            - 거래 기간: %s ~ %s
            - 거래 내역:
            %s
            - 이전 소설 내용:
            %s
            - 성별:
            %s
            - 사용자 결혼 여부:
            %s
                        
            [출력 포맷]
            {
              "title": "생성된 소설 제목",
              "content": "생성된 소설 내용"
            }
                        
            [규칙]
            1. 결혼 여부가 True이면, 남편과 아내를 주인공으로 등장시켜주세요.
            2. 결혼 여부가 False일 때, 성별이 1이면 남성을 주인공으로, 성별이 0이면 여성을 주인공으로 등장시켜주세요.
            2. 거래 내역(금액 포함)을 이야기의 사건, 배경, 갈등 요소로 자연스럽게 녹여내 주세요.
            3. 테마의 분위기를 유지하세요.
            4. 반전, 기승전결 등을 포함시켜주세요.
            5. 소설 제목은 이야기의 핵심을 반영한 제목을 붙여주세요.
            6. 내용은 최소 2~3 문단 이상으로 구성해주세요.
            7. 민감하거나 부정적인 표현은 피해주세요.
            8. 이전에 작성한 소설이 있다면, 이전 소설의 내용에 이어서 작성해주세요.
            9. 연작 소설 형태를 이룰 것이기 때문에, title 뒤에 소설의 몇번째 화인지도 붙혀주세요. (ex. title 1화 )
            위 조건에 따라 이야기를 창의적으로 구성해주세요.
            """.formatted(theme.getName(), startDate, endDate, formatHistoryList(histories),
            formatFictionList(fictionList), gender, isMarried);

        log.info(prompt);

        CompletableFuture<Map<String, Object>> response = geminiUtil.askGemini(prompt)
            .thenApply(geminiUtil::mapResponseToMap);

        Map<String, Object> result = response.join();

        String title = (String) result.get("title");
        String content = (String) result.get("content");
        log.info("제목 : {}  내용 : {}", title, content);

        return FictionContentReadRes.builder()
            .content(content)
            .title(title)
            .build();
    }

    // 소설 기반 AI 그림 생성.
    @Transactional(readOnly = true)
    public FictionArtReadRes getFictionArtAI(FictionArtCreateReq fictionArtCreateReq) {

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
            1. 반드시 남편과 아내라는 인물을 중심으로 장면을 구성하세요.
            2. 소설의 핵심 갈등, 감정, 또는 상징적인 순간을 시각화하세요.
            3. 테마의 분위기(예: 어두운, 로맨틱한, 환상적인 등)를 반영하여 배경과 색감도 함께 묘사해주세요.
            4. 직접적인 대사보다는 묘사 중심의 프롬프트를 작성해주세요.
            5. 민감하거나 부정적인 표현은 피해주세요.
                        
            [중요 사항]
            1. 반드시 입력값의 그림체에 해당하는 그림체로 귀엽게 만들어주세요.
            2. 반드시 이미지 url로 출력해주세요.
            """.formatted(drawStyle, title, content);

        log.info(prompt);

        CompletableFuture<Map<String, Object>> response = geminiUtil.askGemini(prompt)
            .thenApply(geminiUtil::mapResponseToMap);

        Map<String, Object> result = response.join();

        String artUrl = (String) result.get("image_url");

        log.info(artUrl);

        return FictionArtReadRes.builder()
            .imageUrl(artUrl)
            .build();
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

    private String formatFictionList(List<FictionReadRequest> fictionList) {
        StringBuilder sb = new StringBuilder();
        sb.append("[\n");
        for (FictionReadRequest fiction : fictionList) {
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