package com.ssafy.loveledger.domain.story.presentation;

import com.ssafy.loveledger.domain.story.presentation.dto.StoryData;
import com.ssafy.loveledger.domain.story.service.StoryService;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService storyService;

    /**
     * 사용자의 소비내역을 바탕으로 밈을 활용한 소설을 생성합니다. Security Context에서 현재 사용자 정보를 가져옵니다.
     *
     * @param query     밈 검색 키워드
     * @param startDate 시작 날짜 (yyyy-MM-dd 형식)
     * @param endDate   종료 날짜 (yyyy-MM-dd 형식)
     * @param theme     테마 (예: 유행어, 드라마, 영화 등)
     * @return 생성된 소설 응답
     */
    @PostMapping("/generate")
    public StoryData generateStory(
        @RequestParam String query,
        @RequestParam String startDate,
        @RequestParam String endDate,
        @RequestParam String theme) {

        log.info("소설 생성 요청: 쿼리={}, 기간={} ~ {}", query, startDate, endDate);
        ;

        try {
            StoryData response = storyService.generateStory(
                query, startDate, endDate, theme);

            // 응답 로깅
            log.info("생성된 소설: 제목={}", response.getTitle());

            String title = response.getTitle();
            String content = response.getContent();


            return response;
        } catch (LoveLedgerException e) {
            log.error("소설 생성 중 오류 발생: {}", e.getMessage());
            // 오류 발생 시 기본 응답
            return new StoryData("오류 발생", e.getMessage());
        } catch (Exception e) {
            log.error("예상치 못한 오류 발생", e);
            return new StoryData("오류 발생", "서버 내부 오류가 발생했습니다.");
        }
    }
}
