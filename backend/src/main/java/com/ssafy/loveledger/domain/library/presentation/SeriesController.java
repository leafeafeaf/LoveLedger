package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.presentation.dto.request.SeriesCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.SeriesReadResponse;
import com.ssafy.loveledger.domain.library.service.SeriesService;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/series")
@RequiredArgsConstructor
public class SeriesController {

    private final SeriesService seriesService;

    //시리즈 생성
    @PostMapping
    public ResponseEntity<ApiResponse> createSeries(@RequestBody @Valid SeriesCreateReq seriesCreateReq, @AuthenticationPrincipal CustomOAuth2User user) {

        log.info("user {} create series", user.getUserId());

        seriesService.createSeries(user.getLibraryId(), seriesCreateReq);
        return ResponseEntity.ok(ApiResponse.success("시리즈 생성완료", null));
    }

    //시리즈 삭제
    @DeleteMapping("/{seriesId}")
    public ResponseEntity<ApiResponse> deleteSeries(@PathVariable Long seriesId, @AuthenticationPrincipal CustomOAuth2User user) {

        log.info("user {} delete series {}", user.getUserId(), seriesId);

        seriesService.deleteSeries(user.getLibraryId(), seriesId);
        return ResponseEntity.ok(ApiResponse.success("시리즈 정상적으로 삭제되었습니다", null));
    }

    // 시리즈(제목만) 조회
    @GetMapping
    public List<SeriesReadResponse> getSeriesName(@AuthenticationPrincipal CustomOAuth2User user) {

        log.info("user {} get series names", user.getUserId());

        return seriesService.getSeriesNames(user.getLibraryId());
    }
}
