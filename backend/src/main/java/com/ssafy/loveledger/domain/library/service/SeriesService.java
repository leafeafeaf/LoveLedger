package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.library.domain.Library;
import com.ssafy.loveledger.domain.library.domain.Series;
import com.ssafy.loveledger.domain.library.domain.repository.LibraryRepository;
import com.ssafy.loveledger.domain.library.domain.repository.SeriesRepository;
import com.ssafy.loveledger.domain.library.presentation.dto.request.SeriesCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.SeriesReadResponse;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeriesService {

    private final SeriesRepository seriesRepository;
    private final LibraryRepository libraryRepository;

    // 시리즈 생성
    @Transactional
    public void createSeries(Long libraryId, @Valid SeriesCreateReq seriesCreateReq) {

        // series 생성
        Series series = Series.builder()
            .library(Library.builder().id(libraryId).build())
            .title(seriesCreateReq.getTitle())
            .build();

        //series 저장
        seriesRepository.save(series);
    }

    //시리즈 삭제
    @Transactional
    public void deleteSeries(Long LibraryId, Long seriesId) {

        // 삭제하려는 시리즈가 있는지 검색
        Series series = seriesRepository.findById(seriesId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.SERIES_NOT_FOUND, String.valueOf(seriesId)));

        // 유저 서재인지 확인
        if (!series.getLibrary().getId().equals(LibraryId)) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }
        seriesRepository.deleteById(seriesId);
    }

    // 시리즈 제목만 조회
    @Transactional
    public List<SeriesReadResponse> getSeriesNames(Long LibraryId) {

        libraryRepository.findById(LibraryId).orElseThrow(
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
