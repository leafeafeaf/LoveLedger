package com.ssafy.loveledger.global.util;

import com.ssafy.loveledger.domain.story.presentation.dto.QueryRequest;
import com.ssafy.loveledger.domain.story.presentation.dto.StoryData;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * FastAPI 서버와 통신하기 위한 FeignClient 인터페이스
 */
@FeignClient(name = "StoryGenerator", url = "${ssafy.fastapi_url}")
public interface StoryGeneratorClient {

    /**
     * FastAPI의 /query_rag 엔드포인트로 요청을 보내 소설을 생성합니다.
     *
     * @param request 쿼리 요청 객체
     * @return 생성된 소설 응답
     */
    @PostMapping("/query_rag")
    StoryData generateStory(@RequestBody QueryRequest request);
}
