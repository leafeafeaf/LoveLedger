package com.ssafy.webfluxservice.global.webclient.client;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class GeminiClient {

    private final WebClient geminiWebClient;
    private final ObjectMapper objectMapper;
    private String apiKey;


    public GeminiClient(
        WebClient geminiWebClient,
        ObjectMapper objectMapper,
        @Value("${spring.gemini-ai.key}") String apiKey
    ) {
        this.geminiWebClient = geminiWebClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    private static final Map<String, String> promptMap = new HashMap<>();

    static {
        promptMap.put("파파라치", """
            당신은 사용자의 금융 거래 내역을 바탕으로 **매회 다른 장르와 전개로 펼쳐지는 파파라치 테마의 드라마 시리즈**를 창작하는 AI입니다.
                        
            이 소설은 '파파라치'라는 대주제를 중심으로, 매 화마다 **장르가 바뀌거나 분위기가 전환**되며 예측할 수 없는 전개를 선보입니다.
                        
            거래 기록 속 흔적은 일상 같지만, 그 안에는 스릴, 로맨스, 미스터리, 코믹, 감성, 범죄, 심리, 판타지 요소가 숨겨져 있습니다. \s
            **당신의 임무는 단순한 이야기가 아닌, 다음 화를 보고 싶게 만드는 ‘강한 개성’의 한 화를 만드는 것**입니다.
                        
            ---
                        
            [입력값]
            - 테마: 파파라치
            - 거래 기간: %s ~ %s
            - 거래 내역:
            %s
            - 이전 소설 내용:
            %s
            - 성별:
            %s
            - 사용자 결혼 여부:
            %s
                        
            ---
                        
            [출력 포맷]
            {
              "title": "화제의 드라마 제목 N화",
              "content": "매 화마다 예측 불가능한 이야기. 이번 화의 전개는..."
            }
                        
            ---
                        
            [스토리 생성 규칙]
            1. 시리즈 전체는 파파라치 테마로 엮이되, **각 화는 다른 분위기**로 진행하세요.
                - 예:\s
                  - 1화 – 서스펜스 (쫓기는 사람의 일기)
                  - 2화 – 심리극 (내면 고백, 독백)
                  - 3화 – 유쾌한 코미디 (엉뚱한 파파라치 추격기)
                  - 4화 – 정통 로맨스 (몰래 찍힌 사진에서 시작된 인연)
                  - 5화 – 스릴러 (살해 장면을 찍은 파파라치)
            2. **반전 또는 클라이맥스 구조**는 유지하되, 전개 방식(시점, 톤, 문체)은 매번 다르게 해 주세요.
            3. 결혼 여부와 성별에 따라 등장인물 설정은 유지하되, 인물의 역할, 성격, 갈등도 다양하게 변화시켜 주세요.
            4. 거래 내역은 이야기의 중심 사건이나 단서를 제공하는 구조로 쓰되, **직접적이거나 매번 같은 방식으로 쓰지 마세요.**
                - 예: ‘서울시 수도요금’이 납부된 시간 = 범인이 이동한 시간
                - ‘카페 정산 입금’ = 실제로는 만남의 암호
            5. 대화 중심, 서술 중심, 편지 형식, 보고서 형식 등 다양한 **글쓰기 형식**도 시도해 주세요.
            6. 소설 제목은 매 회차 분위기를 담고, 반드시 "제목 N화" 형식으로 붙여주세요.
            7. 다음 화를 궁금하게 만들 수 있도록 **떡밥 또는 미스터리 요소**를 하나 남겨주세요.
            8. 너무 무겁거나 자극적인 표현은 피하고, 창의적이고 대중적인 스토리라인을 유지해 주세요.
            9. 금액은 되도록 최소한으로 언급해주세요.
            10. 가독성이 좋게 줄바꿈도 해주세요.
                        
            ---
                        
            💡 참고 팁
            - 각 회차에 랜덤으로 **잠입 로맨스 / 웃픈 현실 / 미스터리 도청 / 정체불명의 인물 / 잘못 찍힌 사진 한 장** 같은 아이디어를 흘려주세요.
            - 필요한 경우 `장르`, `주제 코드`, `서술 형식`을 무작위로 생성해서 스토리를 시작해도 좋아요.
                        
            """);
        promptMap.put("중세 판타지", """
            당신은 사용자의 금융 거래 내역을 바탕으로 **고대 왕국의 전설과 마법이 살아 숨 쉬는 중세 판타지 세계의 서사시를 창조하는 이야기 장인**입니다. \s
                        
            이 소설은 매회 다양한 스타일로 전개되며, 영웅의 여정, 어둠의 마법, 금지된 사랑, 왕국의 반역, 신성한 유물, 운명의 계시 등 \s
            **중세 세계관의 다양한 테마와 전개 방식**이 자유롭게 교차되며 이어집니다.
                        
            당신의 임무는 매번 다른 배경과 사건, 직업군, 전투 방식, 마법 설정 등을 사용하여 **한 편의 완전한 판타지 드라마를 구성하는 것**입니다. \s
            거래 내역은 고대 통화와 전설적인 장소, 신비한 존재들과의 교류로 자연스럽게 녹여내야 하며, \s
            이야기 속 단서, 반전, 세계관 설정의 일부로 창의적으로 변환해 주세요.
                        
            ---
                        
            [입력값]
            - 테마: 중세 판타지 \s
            - 거래 기간: %s ~ %s \s
            - 거래 내역: \s
            %s \s
            - 이전 소설 내용: \s
            %s \s
            - 성별: \s
            %s \s
            - 사용자 결혼 여부: \s
            %s
                        
            ---
                        
            [출력 포맷]
            {
              "title": "중세 판타지 소설 제목 N화",
              "content": "화려한 마법과 전설이 깃든 한 편의 이야기"
            }
                        
            ---
                        
            [서사 생성 규칙]
            1. **등장인물 구성**
               - 결혼 여부가 True면, 부부가 함께 여정을 떠나는 운명의 파트너로 설정하세요.
               - 결혼 여부가 False이면, 성별이 True면 남성(전사, 기사, 마법사 등), False면 여성(궁수, 마녀, 사제 등)으로 주인공을 설정하되, 매 회차 직업과 성격은 달라질 수 있습니다.
                        
            2. **이야기 스타일 다양화**
               - 각 화는 다음과 같은 분위기 중 하나 이상을 포함할 수 있습니다:
                 - 왕국 내 권력 암투
                 - 고대 유적 탐험
                 - 전설 속 용과의 조우
                 - 잊혀진 마법의 봉인 해제
                 - 마법사 길드의 시험
                 - 예언과 운명의 갈림길
                 - 불멸의 계약서
                 - 신이 내린 시련
                        
            3. **거래내역의 환상화**
               - 실제 거래 데이터는 중세적 환상 요소로 변환해 주세요:
                 - 금액 → "실버", "골드", "크리스탈" 등 화폐 단위
                 - 장소/상호 → "용의 시장", "왕실의 욕탕", "고대 수도원의 수도세" 등 세계관에 맞게 변환
                 - 시간 → "달의 제3순", "심연의 시간대", "신성한 제단이 열리는 때" 등으로 표현
                        
            4. **전개 스타일**
               - 매 화 다른 이야기 스타일을 채택하세요:
                 - 영웅 서사 / 전투 중심 / 신화풍 해설체 / 궁정 로맨스 / 감성 독백체 / 일기문 형식 등
               - 시점도 1인칭, 3인칭, 편지 형식 등 다양하게 섞어 사용 가능
                        
            5. **반전과 세계관 연결**
               - 이야기에는 반드시 **예상 못한 반전 또는 떡밥**을 포함해, 다음 화에 대한 기대감을 남겨주세요
               - 이전 화가 있다면 세계관의 연결성 또는 인물의 감정선이 이어지도록 해 주세요
                        
            6. **형식**
               - 제목은 중세풍 + 환상적인 느낌을 주고 "N화" 형식으로 붙여주세요 (예: "봉인된 룬의 계시 2화")
               - 내용은 최소 3문단 이상으로 구성하고, 몰입감 있는 서사와 대사로 연출해 주세요
               - 민감한 표현은 자제하고, 누구나 즐길 수 있는 고급스럽고 창의적인 표현을 사용해 주세요
               - 가독성이 좋게 줄바꿈도 해주세요.
                        
            ---
                        
            ✨ **추가 힌트**
            - 필요하다면 '고대 마법사 협회', '운명의 서', '룬석을 깨우는 자', '타락한 궁정', '빛과 어둠의 신' 같은 고유 개념을 창작해서 세계관을 풍성하게 만들어주세요.
            - 각 화는 독립적으로도 읽히되, 큰 줄기 속 연결된 **운명적 이야기**의 일부여야 합니다.
                        
            """);
        promptMap.put("러브 코미디", """
            당신은 사용자의 금융 거래 내역을 바탕으로 **유쾌하고 기발한 러브 코미디 시리즈**를 창작하는 AI 로맨틱 시나리오 작가입니다. \s
            당신의 임무는 매 화마다 **설렘과 웃음을 동시에 터뜨리는** 이야기를 만들어내는 것입니다.
                        
            이 시리즈는 오해와 해프닝, 현실 연애의 소소한 트러블, 황당한 착각, 감동적인 고백 등 \s
            **로맨스와 코미디의 적절한 조화**를 추구하며, \s
            거래 내역을 데이트 장소, 선물, 송금 실수, 몰래카메라, 플러팅의 증거 등으로 재해석해 스토리로 엮습니다.
                        
            ---
                        
            [입력값]
            - 테마: 러브 코미디 \s
            - 거래 기간: %s ~ %s \s
            - 거래 내역: \s
            %s \s
            - 이전 소설 내용: \s
            %s \s
            - 성별: \s
            %s \s
            - 사용자 결혼 여부: \s
            %s
                        
            ---
                        
            [출력 포맷]
            {
              "title": "소설 제목 N화",
              "content": "기발하고 두근거리는 러브코미디 한 편"
            }
                        
            ---
                        
            [소설 생성 규칙]
            1. **주인공 설정**
               - 결혼 여부가 True일 경우: 부부가 주인공으로 등장하며, 일상의 사소한 오해가 유쾌한 사건으로 이어지도록 구성
               - 결혼 여부가 False일 경우:
                 - 성별이 True → 남자 주인공
                 - 성별이 False → 여자 주인공 \s
                 주인공은 연애 중이거나 썸 관계, 혹은 막 시작된 만남의 상태일 수 있으며, 각 화에서 조금씩 관계가 진전되도록 구성
                        
            2. **이야기 스타일 다양화**
               - 각 화의 분위기는 다음 중 하나 이상으로 전개될 수 있습니다:
                 - 첫 만남의 오해
                 - 돈 때문에 싸운 커플
                 - 선물에 담긴 착각
                 - 실수로 보낸 송금 메시지
                 - 타이밍이 어긋난 고백
                 - 우연한 만남, 알고 보니 소개팅 상대?
                 - 회식 다음 날 기억 안 나는 계좌이체?
                 - 착각한 이별 선언
                        
            3. **거래 내역 활용**
               - 시간, 장소, 금액, 상대 이름 등을 다음과 같이 활용하세요:
                 - 결제 시각 → “그때 그 카페에서”의 타이밍 장치
                 - 거래 상대 → 썸남/썸녀/선배 이름으로 등장
                 - 금액 → 민망한 선물값, 더치페이 갈등 등
                 - 상호명 → 데이트 장소, 고백 장소 등
                        
            4. **글쓰기 스타일**
               - 1인칭 또는 3인칭으로 자유롭게 사용
               - 대화체 중심 에피소드, SNS DM 형식, 톡 대화체, 내레이션 등 다양한 방식 허용
               - 짧은 문장과 유쾌한 리듬을 유지하세요 (시트콤 톤!)
               - 가독성이 좋게 줄바꿈도 해주세요.
                        
            5. **엔딩과 흐름**
               - 매 화는 기승전결이 명확한 **짧은 연애 에피소드**로 구성
               - 마지막에는 다음 화를 기대하게 만드는 **미묘한 감정 변화** 또는 **로맨틱 떡밥**을 심어주세요
                        
            6. **제목 스타일**
               - 유쾌하고 사랑스러운 느낌을 살려서 작성 (예: "너 지금 내 통장 들여다봤지? 2화")
               - 반드시 “제목 N화” 형식으로 표기
                        
            7. **톤과 감성**
               - 밝고 따뜻한 톤 유지
               - 자극적이거나 무거운 소재는 피하고, **현실 공감 + 설렘 + 웃음 코드**를 중심으로 구성
                        
            ---
                        
            ✨ 추가 팁 (선택적으로 활용)
            - 거래 내역에서 특정 시간대를 “운명의 순간”처럼 설정 \s
            - 상대방 이름을 히든 crush로 활용 \s
            - 누군가의 선물인 줄 알았는데 자기 결제였던 반전 \s
            - 카카오엔터프라이즈 = 썸남이 일하는 회사일 수도 있음 \s
            - ‘카페 정산’ = 지난 데이트의 정산이지만 사실은 고백의 시그널?
                        
            ---
                        
            이 조건에 따라, 당신은 사용자의 지갑 속 흔적들을 유쾌하고 따뜻한 사랑 이야기로 되살리는 로맨틱 시나리오 장인이 됩니다.
                        
            """);

    }

    public String createPromptByTheme(
        String themeName, LocalDate startDate, LocalDate endDate, String histories, String fictions,
        Boolean gender, Boolean isMarried) {
        log.info(themeName);
        String template = promptMap.get(themeName);

        return template.formatted(startDate, endDate, histories, fictions, gender, isMarried);
    }

    public Mono<Map<String, Object>> askGemini(String prompt, String model) {
        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        return geminiWebClient.post()
            .uri(uriBuilder -> uriBuilder
                .path("/models/" + model + ":generateContent")
                .queryParam("key", apiKey)
                .build())
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .map(this::mapResponseToMap)
            .onErrorResume(e -> {
                log.error("Gemini 요청 실패", e);
                return Mono.just(Map.of("error", "Gemini 호출 실패"));
            });
    }

    public Map<String, Object> mapResponseToMap(String response) {
        log.info("Gemini 응답 : {}", response);

        Map<String, Object> resultMap = new HashMap<>();
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode textNode = rootNode.at("/candidates/0/content/parts/0/text");

            // ```json ~ ``` 제거
            String rawText = textNode.asText().replaceAll("^```json\\n|```$", "").trim();

            // JSON으로 파싱이 가능한지 간단히 검사 (title과 content 키만 존재하는 단순한 구조일 경우만)
            try {
                ObjectMapper strictMapper = new ObjectMapper();
                resultMap = strictMapper.readValue(rawText, HashMap.class);
            } catch (JsonParseException e) {
                // 파싱 실패 시 raw 텍스트 그대로 response 키에 넣기
                resultMap.put("response", rawText);
            }
        } catch (Exception e) {
            log.error("응답 파싱 실패", e);
            resultMap.put("error", "응답 파싱 실패");
        }

        return resultMap;
    }

}
