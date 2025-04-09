package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.presentation.dto.request.series.SeriesCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.series.SeriesReadResponse;
import com.ssafy.loveledger.domain.library.service.SeriesService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.util.UserUtil;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/series")
@RequiredArgsConstructor
public class SeriesController {

    private final SeriesService seriesService;
    private final UserUtil userUtil;

    //시리즈 생성
    @PostMapping
    public SeriesReadResponse createSeries(@RequestBody @Valid SeriesCreateReq seriesCreateReq) {
        User user = userUtil.getCurrentUser();

        log.info("user {} create series", user.getId());

        return seriesService.createSeries(user, seriesCreateReq);
    }

    //시리즈 삭제
    @DeleteMapping("/{seriesId}")
    public void deleteSeries(@PathVariable Long seriesId) {
        User user = userUtil.getCurrentUser();

        log.info("user {} delete series {}", user.getId(), seriesId);

        seriesService.deleteSeries(user, seriesId);
    }

    // 시리즈(제목만) 조회
    @GetMapping
    public List<SeriesReadResponse> getSeriesName() {
        User user = userUtil.getCurrentUser();

        log.info("user {} get series names", user.getId());

        return seriesService.getSeriesNames(user);
    }
}
