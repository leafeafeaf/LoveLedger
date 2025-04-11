package com.ssafy.loveledger.global.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
public class GeminiUtil {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String backUrl;

    private static final Map<String, String> promptMap = new HashMap<>();
    private static final Map<String, String> promptArt = new HashMap<>();

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
            - 주인공 이름 :
            %s
            - 배우자 이름 :
            %s
            - 성별:
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
            3. 배우자 이름이 null 이면, 주인공은 한 명으로, 주인공 이름을 적용하여 주세요. 반면, 배우자 이름이 존재한다면, 배우자의 이름으로 한 인물을 반드시 등장시켜주세요.
            4. 주인공 이름과 배우자 이름, 성별에 따라 등장인물 설정은 유지하되, 인물의 역할, 성격, 갈등도 다양하게 변화시켜 주세요.
            5. 거래 내역은 이야기의 중심 사건이나 단서를 제공하는 구조로 쓰되, **직접적이거나 매번 같은 방식으로 쓰지 마세요.**
                - 예: ‘서울시 수도요금’이 납부된 시간 = 범인이 이동한 시간
                - ‘카페 정산 입금’ = 실제로는 만남의 암호
            6. 대화 중심, 서술 중심, 편지 형식, 보고서 형식 등 다양한 **글쓰기 형식**도 시도해 주세요.
            7. 소설 제목은 매 회차 분위기를 담고, 반드시 "제목 N화" 형식으로 붙여주세요.
            8. 다음 화를 궁금하게 만들 수 있도록 **떡밥 또는 미스터리 요소**를 하나 남겨주세요.
            9. 너무 무겁거나 자극적인 표현은 피하고, 창의적이고 대중적인 스토리라인을 유지해 주세요.
            10. 금액은 되도록 최소한으로 언급해주세요.
            11. 가독성이 좋게 줄바꿈도 해주세요.
            12. 이모티콘은 최소한으로 사용해주세요.
            13. 반드시 한국어로 작성해주세요.
            ---
            
            💡 참고 팁
            - 각 회차에 랜덤으로 **잠입 로맨스 / 웃픈 현실 / 미스터리 도청 / 정체불명의 인물 / 잘못 찍힌 사진 한 장** 같은 아이디어를 흘려주세요.
            
            다음 조건을 반드시 지켜서 JSON 형식으로 응답해 주세요:
            
            JSON 구조는 다음과 같이 해주세요:
            
            { "title": "제목", "content": "소설 본문 내용 (줄바꿈은 \\n으로 표현)" }
            
            JSON은 반드시 Markdown 코드 블럭 형식으로 감싸 주세요.
            예: 시작은 ```json, 끝은 ```로 해주세요.
            (즉, text 안의 문자열은 "```json\\n{...}\\n```" 형태여야 합니다.)
            
            문자열 처리 시 주의사항:
            
            content 안의 줄바꿈은 반드시 이스케이프된 \\n 으로 표현해 주세요. 실제 개행 문자(Enter)는 사용하지 마세요.
            
            content, title 모두 쌍따옴표(")는 반드시 "로 이스케이프 처리해주세요.
            
            작은따옴표(')는 절대 이스케이프하지 말고 그대로 사용하세요. → \\′ 이런 식의 escape는 사용하지 마세요.
            
            역슬래시()가 필요한 경우는 반드시 \\ 로 이스케이프 해주세요.
            
            JSON 내부는 유효한 JSON 형식이어야 하며, 파싱 가능한 형태로 출력해 주세요.
            
            예시 응답 형태:
            
            "parts": [ { "text": "```json\\n{\\n \\"title\\": \\"제목\\",\\n \\"content\\": \\"첫 문장입니다.\\\\n두 번째 줄입니다.\\\\n세 번째 줄입니다.\\"\\n}```" } ]
            
            이 형식을 꼭 지켜주세요.
            
            주의사항:
            
            작은따옴표(‘ ’)를 \\로 이스케이프하지 말고 그냥 쓰세요 ('그녀는 말했다')
            
            content 값 안에 줄바꿈이 필요할 경우 \\n 문자로 표현해 주세요.
            
            이중으로 escape된 문자열 ("\\n")은 사용하지 마세요.
            
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
            - 주인공 이름 :
            %s \s
            - 배우자 이름 :
            %s \s
            - 성별: \s
            %s \s
            
            ---
            
            [출력 포맷]
            {
              "title": "중세 판타지 소설 제목 N화",
              "content": "화려한 마법과 전설이 깃든 한 편의 이야기"
            }
            
            ---
            
            [서사 생성 규칙]
            1. **등장인물 구성**
               - 배우자 이름이 null 이면, 주인공은 한 명으로, 주인공 이름을 적용하여 주세요. 성별이 True면 남성(전사, 기사, 마법사 등), False면 여성(궁수, 마녀, 사제 등)으로 주인공을 설정하되, 매 회차 직업과 성격은 달라질 수 있습니다.
               - 반면, 배우자 이름이 존재한다면, 배우자의 이름으로 한 인물을 반드시 등장시켜주고,부부가 함께 여정을 떠나는 운명의 파트너로 설정하세요.
            
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
            
            7. 이모티콘은 최소한으로 사용해주세요.
            8. 반드시 한국어로 작성해주세요.
            9. 금화 가치는 동일하게 하나로 통일해주세요.
            ---
            
            ✨ **추가 힌트**
            - 필요하다면 '고대 마법사 협회', '운명의 서', '룬석을 깨우는 자', '타락한 궁정', '빛과 어둠의 신' 같은 고유 개념을 창작해서 세계관을 풍성하게 만들어주세요.
            - 각 화는 독립적으로도 읽히되, 큰 줄기 속 연결된 **운명적 이야기**의 일부여야 합니다.
            
            다음 조건을 반드시 지켜서 JSON 형식으로 응답해 주세요:
            
            JSON 구조는 다음과 같이 해주세요:
            
            { "title": "제목", "content": "소설 본문 내용 (줄바꿈은 \\n으로 표현)" }
            
            JSON은 반드시 Markdown 코드 블럭 형식으로 감싸 주세요.
            예: 시작은 ```json, 끝은 ```로 해주세요.
            (즉, text 안의 문자열은 "```json\\n{...}\\n```" 형태여야 합니다.)
            
            문자열 처리 시 주의사항:
            
            content 안의 줄바꿈은 반드시 이스케이프된 \\n 으로 표현해 주세요. 실제 개행 문자(Enter)는 사용하지 마세요.
            
            content, title 모두 쌍따옴표(")는 반드시 "로 이스케이프 처리해주세요.
            
            작은따옴표(')는 절대 이스케이프하지 말고 그대로 사용하세요. → \\′ 이런 식의 escape는 사용하지 마세요.
            
            역슬래시()가 필요한 경우는 반드시 \\ 로 이스케이프 해주세요.
            
            JSON 내부는 유효한 JSON 형식이어야 하며, 파싱 가능한 형태로 출력해 주세요.
            
            예시 응답 형태:
            
            "parts": [ { "text": "```json\\n{\\n \\"title\\": \\"제목\\",\\n \\"content\\": \\"첫 문장입니다.\\\\n두 번째 줄입니다.\\\\n세 번째 줄입니다.\\"\\n}```" } ]
            
            이 형식을 꼭 지켜주세요.
            
            주의사항:
            
            작은따옴표(‘ ’)를 \\로 이스케이프하지 말고 그냥 쓰세요 ('그녀는 말했다')
            
            content 값 안에 줄바꿈이 필요할 경우 \\n 문자로 표현해 주세요.
            
            이중으로 escape된 문자열 ("\\n")은 사용하지 마세요.
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
            - 주인공 이름 :
            %s \s
            - 배우자 이름 :
            %s \s
            - 성별: \s
            %s \s
            
            
            ---
            
            [출력 포맷]
            {
              "title": "소설 제목 N화",
              "content": "기발하고 두근거리는 러브코미디 한 편"
            }
            
            ---
            
            [소설 생성 규칙]
            1. **주인공 설정**
            
               - 반면, 배우자 이름이 존재한다면, 배우자의 이름으로 한 인물을 반드시 등장시켜주세요. 부부가 주인공으로 등장하며, 일상의 사소한 오해가 유쾌한 사건으로 이어지도록 구성해주세요.
                 - 부부가 주인공으로 등장하며, 일상의 사소한 오해가 유쾌한 사건으로 이어지도록 구성
            
               - 배우자 이름이 null 이면, 주인공은 한 명으로, 주인공 이름을 적용하여 주세요.
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
            
            8. 이모티콘은 최소한으로 사용해주세요.
            9. 반드시 한국어로 작성해주세요.
            ---
            
            ✨ 추가 팁 (선택적으로 활용)
            - 거래 내역에서 특정 시간대를 “운명의 순간”처럼 설정 \s
            - 상대방 이름을 히든 crush로 활용 \s
            - 누군가의 선물인 줄 알았는데 자기 결제였던 반전 \s
            - 카카오엔터프라이즈 = 썸남이 일하는 회사일 수도 있음 \s
            - ‘카페 정산’ = 지난 데이트의 정산이지만 사실은 고백의 시그널?
            
            ---
            
            이 조건에 따라, 당신은 사용자의 지갑 속 흔적들을 유쾌하고 따뜻한 사랑 이야기로 되살리는 로맨틱 시나리오 장인이 됩니다.
            
            다음 조건을 반드시 지켜서 JSON 형식으로 응답해 주세요:
            
            JSON 구조는 다음과 같이 해주세요:
            
            { "title": "제목", "content": "소설 본문 내용 (줄바꿈은 \\n으로 표현)" }
            
            JSON은 반드시 Markdown 코드 블럭 형식으로 감싸 주세요.
            예: 시작은 ```json, 끝은 ```로 해주세요.
            (즉, text 안의 문자열은 "```json\\n{...}\\n```" 형태여야 합니다.)
            
            문자열 처리 시 주의사항:
            
            content 안의 줄바꿈은 반드시 이스케이프된 \\n 으로 표현해 주세요. 실제 개행 문자(Enter)는 사용하지 마세요.
            
            content, title 모두 쌍따옴표(")는 반드시 "로 이스케이프 처리해주세요.
            
            작은따옴표(')는 절대 이스케이프하지 말고 그대로 사용하세요. → \\′ 이런 식의 escape는 사용하지 마세요.
            
            역슬래시()가 필요한 경우는 반드시 \\ 로 이스케이프 해주세요.
            
            JSON 내부는 유효한 JSON 형식이어야 하며, 파싱 가능한 형태로 출력해 주세요.
            
            예시 응답 형태:
            
            "parts": [ { "text": "```json\\n{\\n \\"title\\": \\"제목\\",\\n \\"content\\": \\"첫 문장입니다.\\\\n두 번째 줄입니다.\\\\n세 번째 줄입니다.\\"\\n}```" } ]
            
            이 형식을 꼭 지켜주세요.
            
            주의사항:
            
            작은따옴표(‘ ’)를 \\로 이스케이프하지 말고 그냥 쓰세요 ('그녀는 말했다')
            
            content 값 안에 줄바꿈이 필요할 경우 \\n 문자로 표현해 주세요.
            
            이중으로 escape된 문자열 ("\\n")은 사용하지 마세요.
            """);

    }

    static {
        promptArt.put("webtoon", "웹툰 특유의 깨끗한 디지털 선화와 생동감 있는 표정, 채도가 높은 색감으로 감정을 강조한 장면. 눈과 얼굴 표현이 섬세하고, 컷과 컷 사이 여백이 감정의 흐름을 만들어낸다. 배경은 단순하거나 연한 그라데이션으로 처리되어 캐릭터에 집중되며, 웹툰만의 감성적인 분위기를 자아낸다.");
        promptArt.put("realistic", "사진처럼 사실적이고 정교한 묘사. 인물의 피부 질감, 조명, 의상 주름까지 디테일하게 표현되며, 실제 배경을 보는 듯한 깊이와 사실감을 갖춘다. 색감은 현실에 가깝고 자연광이나 인공조명에 따른 명암과 분위기가 명확하게 반영된다. 인물의 감정도 섬세한 표정과 자세를 통해 표현된다.");
        promptArt.put("watercolor", "번진 듯한 물감 터치와 부드러운 색감이 특징이며, 투명하고 은은한 느낌을 준다. 종이 질감이 보일 정도로 자연스럽고, 경계가 선명하지 않아 몽환적이고 감성적인 분위기를 연출한다. 인물이나 배경도 날카로운 윤곽선 없이 흐릿하게 스며들듯 표현된다.");
        promptArt.put("oilpainting", "극적으로 두껍게 덧발라진 임파스토 붓터치가 질감 있는 캔버스 위에 겹겹이 쌓인 유화. 입체적인 효과를 주는 굵고 조형적인 붓질, 물감을 긁고 올리는 물리적 표현이 뚜렷하게 드러나며, 과 어둠의 강렬한 대비는 감정적인 깊이를 더한다. 뜻한 색감은 부드럽게 녹아들듯 번지며, 전체적으로 전통 유화 특유의 촉감적이고 감성적인 화풍을 완전히 담아낸다. 사람의 얼굴도 흐리게. 인상주의 화법, 고흐, 마네, 모네가 그린 그림의 화법,https://pbs.twimg.com/media/DUME37nUMAAjqzO.jpg을 참고해줘");
        promptArt.put("sketch", "연필이나 펜으로 빠르게 그린 듯한 선 중심의 드로잉 스타일. 채색이 없는, 흑백 색상으로만 표현되며, 라인과 명암만으로 인물의 형태와 감정을 묘사한다. 거칠지만 생동감 있는 선이 특징이며, 인물의 동세나 장면의 순간성을 강조하는 데 효과적이다.");
        promptArt.put("ghibli", "스튜디오 지브리 애니메이션의 따뜻하고 디테일한 그림체. 부드러운 색감과 풍부한 배경 묘사, 감정을 담은 눈망울과 순수한 인물이 특징이다. 자연 배경과 도시 풍경 모두 섬세하게 표현되며, 현실과 환상이 섞인 듯한 서정적인 분위기를 자아낸다.");

    }

    public GeminiUtil(RestTemplateBuilder restTemplateBuilder,
                      @Value("${spring.gemini-ai.key}") String apiKey,
                      @Value("${spring.gemini-ai.backend-url}") String backUrl) {
        this.restTemplate = restTemplateBuilder.build();
        this.apiKey = apiKey;
        this.backUrl = backUrl;
    }

    @Async
    public CompletableFuture<String> askGemini(String prompt) {
        return askGemini(prompt, "gemini-2.0-flash");  // 기본값 적용
    }

    @Async
    public CompletableFuture<String> askGemini(String prompt, String model) {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model
            + ":generateContent?key=" + apiKey;
        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Referer", backUrl);
        Map<String, Object> body = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        body.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request,
            String.class);

        return CompletableFuture.completedFuture(response.getBody());
    }

    //TODO 에러 전역 처리
    public Map<String, Object> mapResponseToMap(String response) {
        log.info("Gemini 응답 : {}", response);

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> resultMap = new HashMap<>();

        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode candidatesNode = rootNode.path("candidates");
            if (candidatesNode.isArray() && !candidatesNode.isEmpty()) {
                JsonNode contentNode = candidatesNode.get(0).path("content");
                JsonNode partsNode = contentNode.path("parts");
                if (partsNode.isArray() && !partsNode.isEmpty()) {
                    String text = partsNode.get(0).path("text").asText();

                    // 불필요한 코드 블록(````json` 및 ``` 제거)
                    text = text.replaceAll("^```json\\n|```$", "").trim();

                    // JSON 형식이면 HashMap으로 변환, 아니면 단순 텍스트 저장
                    try {
                        if (text.startsWith("{") && text.endsWith("}")) {
                            resultMap = objectMapper.readValue(text, HashMap.class);
                        } else {
                            resultMap.put("response", text);
                        }
                    } catch (Exception e) {
                        resultMap.put("error", "Invalid JSON format in content");
                    }
                } else {
                    resultMap.put("error", "No valid content found");
                }
            } else {
                resultMap.put("error", "No valid response found");
            }
        } catch (Exception e) {
            log.error(e.getMessage());
            resultMap.put("error", "Failed to parse response");
        }

        return resultMap;
    }

    public Map<String, Object> mapFictionResponseToMap(String response) {
        log.info("Gemini 응답 : {}", response);

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> resultMap = new HashMap<>();

        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode candidatesNode = rootNode.path("candidates");

            if (candidatesNode.isArray() && !candidatesNode.isEmpty()) {
                JsonNode contentNode = candidatesNode.get(0).path("content");
                JsonNode partsNode = contentNode.path("parts");

                if (partsNode.isArray() && !partsNode.isEmpty()) {
                    String rawText = partsNode.get(0).path("text").asText();

                    // 1. 코드 블록 제거 (```json ~ ```)
                    String jsonText = rawText
                        .replaceAll("(?s)^```json\\s*", "")
                        .replaceAll("\\s*```$", "")
                        .trim();

                    // 2. JSON 파싱을 위한 처리
                    Map<String, Object> tempMap = null;

                    try {
                        // 먼저 파싱 시도 (이 때 줄바꿈이 이스케이프 돼 있으면 성공함)
                        tempMap = objectMapper.readValue(jsonText, HashMap.class);
                    } catch (Exception e) {
                        log.warn("1차 JSON 파싱 실패: {}", e.getMessage());
                        // 실패하면 → 줄바꿈 문자들을 이스케이프 처리 후 다시 시도
                        String escapedJsonText = jsonText
                            .replace("\r\n", "\\n")
                            .replace("\n", "\\n");

                        try {
                            tempMap = objectMapper.readValue(escapedJsonText, HashMap.class);
                        } catch (Exception ex) {
                            log.warn("2차 JSON 파싱 실패: {}", ex.getMessage());
                            log.warn("문제된 JSON 문자열:\n{}", jsonText);
                            resultMap.put("error", "Invalid JSON format after retry");
                            return resultMap;
                        }
                    }

                    // 3. content 안의 줄바꿈 이스케이프를 실제 줄바꿈으로 변환
                    if (tempMap.containsKey("content")) {
                        Object contentObj = tempMap.get("content");
                        if (contentObj instanceof String) {
                            String content = (String) contentObj;
                            content = content.replace("\\n", "\n");  // \n → 실제 개행
                            tempMap.put("content", content);
                        }
                    }

                    resultMap = tempMap;

                } else {
                    resultMap.put("error", "No valid parts found");
                }
            } else {
                resultMap.put("error", "No valid candidates found");
            }

        } catch (Exception e) {
            log.error("전체 파싱 실패: {}", e.getMessage());
            resultMap.put("error", "Failed to parse Gemini response");
        }

        return resultMap;
    }

    public String createPromptByTheme(
        String themeName, LocalDate startDate, LocalDate endDate, String histories, String fictions, String userName, String loverName, Boolean gender) {
        log.info(themeName);
        String template = promptMap.get(themeName);

        return template.formatted(startDate, endDate, histories, fictions, userName, loverName, gender);
    }

    public String getVisualFeature(String drawStyle) {

        return promptArt.get(drawStyle);
    }
}
