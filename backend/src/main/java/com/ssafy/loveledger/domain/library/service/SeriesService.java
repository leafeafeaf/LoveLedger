package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.library.domain.Series;
import com.ssafy.loveledger.domain.library.domain.repository.LibraryRepository;
import com.ssafy.loveledger.domain.library.domain.repository.SeriesRepository;
import com.ssafy.loveledger.domain.library.presentation.dto.request.series.SeriesCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.series.SeriesReadResponse;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeriesService {

    private final SeriesRepository seriesRepository;
    private final LibraryRepository libraryRepository;

    // 시리즈 생성
    @Transactional
    public SeriesReadResponse createSeries(User user, @Valid SeriesCreateReq seriesCreateReq) {

        // series 생성
        Series series = Series.builder()
            .library(user.getLibrary())
            .title(seriesCreateReq.getTitle())
            .build();

        //series 저장
        seriesRepository.save(series);

        return SeriesReadResponse.builder().seriesId(series.getId()).title(series.getTitle())
            .build();
    }

    //시리즈 삭제
    @Transactional
    public void deleteSeries(User user, Long seriesId) {

        // 삭제하려는 시리즈가 있는지 검색
        Series series = seriesRepository.findById(seriesId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.SERIES_NOT_FOUND, String.valueOf(seriesId)));

        // 유저 서재인지 확인
        if (!series.getLibrary().equals(user.getLibrary())) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }
        seriesRepository.deleteById(seriesId);
    }

    // 시리즈 제목만 조회
    @Transactional
    public List<SeriesReadResponse> getSeriesNames(User user) {

        libraryRepository.findById(user.getLibrary().getId()).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS));

        List<Series> seriesList = seriesRepository.findAll();

        return seriesList.stream()
            .map(series -> SeriesReadResponse.builder()
                .seriesId(series.getId())
                .title(series.getTitle())
                .build())
            .toList();

    }
}
