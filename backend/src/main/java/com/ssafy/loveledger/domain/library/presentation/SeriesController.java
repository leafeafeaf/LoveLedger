package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.domain.Series;
import com.ssafy.loveledger.domain.library.presentation.dto.request.SeriesCreateReq;
import com.ssafy.loveledger.domain.library.service.SeriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/series")
@RequiredArgsConstructor
public class SeriesController {

    private final SeriesService seriesService;

    //시리즈 생성
    @PostMapping
    public ResponseEntity<?> createSeries(@RequestBody SeriesCreateReq seriesCreateReq) {

        // 토큰에서 유저 iD 추출
        Long userId = 1L;

        // 시리즈 생성
        seriesService.createSeries(seriesCreateReq.getTitle(), userId);
        return ResponseEntity.ok("시리즈 생성완료");
    }

    //시리즈 삭제
    @DeleteMapping("/{seriesId}")
    public ResponseEntity<?> deleteSeries(@PathVariable Long seriesId) {
        seriesService.deleteSeries(seriesId);
        return ResponseEntity.ok("시리즈 삭제완료 {seriesId} : " + seriesId);
    }

    // 시리즈(제목만) 조회
    @GetMapping
    public ResponseEntity<?> getSeriesName() {

        List<Series> seriesList = seriesService.getSeriesNames();

        List<Map<String, Object>> seriesData = new ArrayList<>();

        for (Series series : seriesList) {
            Map<String, Object> seriesDataMap = new HashMap<>();
            seriesDataMap.put("seriesid", series.getId());
            seriesDataMap.put("seriesname", series.getSeriesTitle());
            seriesData.add(seriesDataMap);
        }

        return ResponseEntity.ok(seriesData);
    }

}
