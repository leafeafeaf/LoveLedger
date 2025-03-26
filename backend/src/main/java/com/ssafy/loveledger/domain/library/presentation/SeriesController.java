package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.presentation.dto.request.SeriesCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.SeriesReadResponse;
import com.ssafy.loveledger.domain.library.service.SeriesService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.global.util.UserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/series")
@RequiredArgsConstructor
public class SeriesController {

    private final SeriesService seriesService;
    private final UserUtil userUtil;
    private final UserRepository userRepository;

    //시리즈 생성
    @PostMapping
    public void createSeries(@RequestBody @Valid SeriesCreateReq seriesCreateReq) {
        User user = userUtil.getCurrentUser();

        // test
//        User user = userRepository.findById(1L).orElse(null);

        log.info("user {} create series", user.getId());

        seriesService.createSeries(user, seriesCreateReq);
    }

    //시리즈 삭제
    @DeleteMapping("/{seriesId}")
    public void deleteSeries(@PathVariable Long seriesId) {
        User user = userUtil.getCurrentUser();

        // test
//        User user = userRepository.findById(1L).orElse(null);

        log.info("user {} delete series {}", user.getId(), seriesId);

        seriesService.deleteSeries(user, seriesId);
    }

    // 시리즈(제목만) 조회
    @GetMapping
    public List<SeriesReadResponse> getSeriesName() {
        User user = userUtil.getCurrentUser();

        // test
//        User user = userRepository.findById(1L).orElse(null);

        log.info("user {} get series names", user.getId());

        return seriesService.getSeriesNames(user);
    }
}
