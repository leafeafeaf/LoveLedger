package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.library.domain.Library;
import com.ssafy.loveledger.domain.library.domain.Series;
import com.ssafy.loveledger.domain.library.domain.repository.LibraryRepository;
import com.ssafy.loveledger.domain.library.domain.repository.SeriesRepository;
import jakarta.transaction.Transactional;
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
    public void createSeries(String seriesTitle, Long userId) {

        //userId로 Library 가져오기
        // TODO : error 메시지 변경
        Library library = libraryRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Library not found for user"));

        // TODO : series Title 중복 체크

        // Series 생성
        Series series = new Series();
        series.setSeriesTitle(seriesTitle);
        series.setLibrary(library);

        seriesRepository.save(series);
    }

    //시리즈 삭제
    @Transactional
    public void deleteSeries(Long seriesId) {
        boolean exits = seriesRepository.existsById(seriesId);
        if (!exits) {
            throw new IllegalArgumentException("해당 시리즈가 없습니다.");
        }

        // TODO : 본인이 만든 series인지 확인 필요.

        seriesRepository.deleteById(seriesId);
    }

    // 시리즈 제목만 조회
    @Transactional
    public List<Series> getSeriesNames() {
        return seriesRepository.findAll();
    }
}
