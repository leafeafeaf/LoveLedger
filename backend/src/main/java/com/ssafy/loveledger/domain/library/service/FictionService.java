package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.couple.domain.Couple;
import com.ssafy.loveledger.domain.couple.domain.repository.CoupleRepository;
import com.ssafy.loveledger.domain.history.domain.History;
import com.ssafy.loveledger.domain.history.domain.repository.HistoryRepository;
import com.ssafy.loveledger.domain.library.domain.Fiction;
import com.ssafy.loveledger.domain.library.domain.Series;
import com.ssafy.loveledger.domain.library.domain.Theme;
import com.ssafy.loveledger.domain.library.domain.repository.FictionRepository;
import com.ssafy.loveledger.domain.library.domain.repository.LibraryRepository;
import com.ssafy.loveledger.domain.library.domain.repository.SeriesRepository;
import com.ssafy.loveledger.domain.library.domain.repository.ThemeRepository;
import com.ssafy.loveledger.domain.library.presentation.dto.request.fiction.FictionAllCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.fiction.FictionArtCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.fiction.FictionContentCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.fiction.FictionReadRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.response.fiction.*;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import com.ssafy.loveledger.global.util.GeminiUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

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
    private final CoupleRepository coupleRepository;

    // 소설 생성
    @Transactional
    public void createFiction(FictionAllCreateRequest fictionCreateReq) {

        Fiction fiction = Fiction.builder()
            .series(Series.builder().id(fictionCreateReq.getSeriesId()).build())
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
        String userName = user.getName();
        String loverName = null;

        Couple couple = coupleRepository.findByUserId(user.getId()).orElse(null);

        if (couple != null) {
            User lover =
                couple.getUsers().get(0) == user ? couple.getUsers().get(1) : couple.getUsers().get(0);
            loverName = lover.getName();
        }

        log.info(loverName);

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

        // 프롬프트 만들기
        String prompt = geminiUtil.createPromptByTheme(
            theme.getName(), startDate, endDate, formatHistoryList(histories),
            formatFictionList(fictionList), userName, loverName, gender
        );
        CompletableFuture<Map<String, Object>> response = geminiUtil.askGemini(prompt)
            .thenApply(geminiUtil::mapFictionResponseToMap);

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
        String visual = geminiUtil.getVisualFeature(drawStyle);

        String prompt = """
            당신은 그림체, 소설의 제목과 내용에 따라 한 장의 그림을 생성하여 이미지 url로 보여주는 AI 비서입니다.\s
            당신의 임무는 주어진 소설 정보를 바탕으로 **딱 한 장면을 상상하여**, 입력된 그림체 스타일에 맞춰 묘사한 프롬프트를 키워드 위주로 만들고, 해당 프롬프트로 생성된 **이미지 URL**을 출력하는 것입니다.
            
            [입력값]
            - 그림체: %s (그림의 스타일)
            - 그림체 특징 : %s
            - 제목: %s (소설의 중심 주제를 담고 있는 문장입니다.)
            - 내용: (주요 사건, 인물, 배경이 서술된 본문입니다. 이 내용을 바탕으로 장면을 상상해주세요.)
            %s
            
            [출력 목적]
            - 위의 정보를 바탕으로 **단 하나의 장면**을 **입력된 그림체 스타일로 시각적으로 묘사**하기 위한 텍스트 프롬프트를 생성하고,
            - 해당 프롬프트로 생성된 이미지 URL을 **JSON 형식**으로 반환합니다.
            - 무조건 url에 항상 seed값을 넣어주세요. seed 값은 항상 11 ex: https://image.pollinations.ai/prompt/?seed=11
            
            [출력 형식]
            {
              "image_url": "https://~"
            }
            - 반드시 위와 같이 JSON 코드 블럭(json ... ) 안에 포함해 주세요.
            - URL은 반드시 실제 이미지 생성에 사용 가능한 형태여야 하며, Markdown 문법을 따라야 합니다.
            
            [규칙]
            1. **반드시 반드시 소설의 인물을 중심으로 장면을 구성하세요.**
            2. 소설의 핵심 갈등, 감정, 또는 상징적인 순간을 시각화하세요.
            3. 테마의 분위기(예: 어두운, 로맨틱한, 환상적인 등)를 반영하여 배경과 색감도 함께 묘사해주세요.
            4. 직접적인 대사보다는 묘사 중심의 프롬프트를 작성해주세요.
            5. 민감하거나 부정적인 표현은 피해주세요.
            6. 소설의 등장하는 인물들의 이름과 감정은 키워드화해서 프롬프트를 작성해주세요.
            7. yend yonu. 와 같은 이미지가 안나오도록 해줘.
            8. 출력에는 띄어쓰기가 있으면 안돼.
            
            
            [중요 사항]
            1. 반드시 소설 속 인물을 중심으로 장면을 구성하세요. 인물은 감정, 행동, 의상, 표정이 드러나야 합니다.
            
            2. 인물의 주요 행동이나 상징적인 순간, 감정이 폭발하는 시점 등을 시각화하세요.
            
            3. 장면의 배경, 시간대, 분위기를 명확히 설정하세요. 예: 새벽녘, 실내 카페, 별빛 아래 언덕 등
            
            4. 배경에는 테마에 어울리는 색감, 조명, 구도 등을 포함하세요.
            
            5. 직접적인 대사 인용은 삼가고, 묘사 중심의 문장으로 구성하세요.
            
            6. 입력된 그림체 스타일의 시각적 특성을 문장 안에 통합해 주세요. 예: "수채화풍의 번진 붓터치", "실사 스타일의 현실적인 조명"
            
            7. 민감하거나 폭력적, 선정적인 표현은 절대 사용하지 마세요.
            
            8.가능한 한 귀엽고 따뜻한 분위기로 표현해 주세요 (단, 이야기의 분위기가 그렇지 않은 경우는 예외).
            
            9. 반환값은 반드시 "image_url" 키를 가진 유효한 JSON 객체여야 합니다.
            
            10. url에 항상 seed값을 넣어줘 seed 값은 반드시 11. 항상 마지막에 seed=11로 해주세요. ex: https://image.pollinations.ai/prompt/?seed=11
            
            11. 생성되는 프롬프트는 가능한 한 압축된 핵심 키워드 위주로 구성하고, 너무 길거나 문장형이 되지 않도록 해주세요.
            
            12. URL이 반드시 한 줄로 출력되도록 하며, 줄바꿈이나 특수 문자로 인해 잘리지 않게 완전한 형태로 끝까지 출력해주세요.
            
            13. URL에는 반드시 'https://image.pollinations.ai/prompt/' 로 시작하고, 마지막은 '&seed=11'로 종료되어야 합니다.
            
            14. 프롬프트는 쉼표(,)로 구분된 짧은 키워드 형태로 구성하여 URL 내에서 깨지지 않도록 합니다.
            
            15. 절대로 줄바꿈, 공백, 쌍따옴표, 괄호 등을 프롬프트에 포함하지 마세요. 키워드는 영어 또는 한국어 단어로 구성하며, 문장이 되지 않도록 합니다.
            
            16. 프롬프트에는 텍스트가 삽입되지 않도록 다음 키워드를 항상 포함해주세요: notext, noletters, nocaptions, nospeechbubbles, nosigns, nowatermark.
            
            17. 그림에 글자를 표시할 경우 한글로 작성해주세요.
            
            18. 인물 이름이 영어로 들어갈 경우에도 실제 영어 단어처럼 오해될 수 있는 조합은 피해주세요. 이름은 로마자 표기하거나 생략해도 좋습니다.
            
            19. 프롬프트의 총 길이가 너무 길 경우 키워드를 우선순위에 따라 12~15개 이내로 압축하여 간결하게 구성해주세요.
            
            20. 반드시 프롬프트 키워드와 seed=11을 포함한 URL 전체가 한 줄로 출력되어야 하며, 줄바꿈이나 문장형 설명 없이 **사용 가능한 URL 형태**로 마무리해야 합니다.
            
            """.formatted(drawStyle, visual, title, content);

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
                history.getTransactionType() == 1 ? "입금" : "출금",
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