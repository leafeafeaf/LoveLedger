package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.domain.Series;
import com.ssafy.loveledger.domain.library.presentation.dto.request.SeriesPostDTO;
import com.ssafy.loveledger.domain.library.service.SeriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/series")
@RequiredArgsConstructor
public class SeriesController {

    private final SeriesService seriesService;

    @PostMapping
    public ResponseEntity<Series> createSeries(@RequestBody SeriesPostDTO seriesPostDTO) {

        // 토큰에서 유저 iD 추출
        Long userId = 1L;

        // 시리즈 생성
        Series series = seriesService.createSeries(seriesPostDTO.getTitle(), userId);
        return ResponseEntity.ok(series);
    }

    @DeleteMapping("/{seriesId}")
    public ResponseEntity<Void> deleteSeries(@PathVariable Long seriesId) {
        seriesService.deleteSeries(seriesId);
        return ResponseEntity.noContent().build();
    }
}
