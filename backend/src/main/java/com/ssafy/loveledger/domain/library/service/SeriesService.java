package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.library.domain.Library;
import com.ssafy.loveledger.domain.library.domain.Series;
import com.ssafy.loveledger.domain.library.domain.repository.LibraryRepository;
import com.ssafy.loveledger.domain.library.domain.repository.SeriesRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SeriesService {

    private final SeriesRepository seriesRepository;
    private final LibraryRepository libraryRepository;

    @Transactional
    public Series createSeries(String seriesTitle, Long userId) {

        //userId로 Library 가져오기
        // TODO : error 메시지 변경
        Library library = libraryRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Library not found for user"));

        // TODO : series Title 중복 체크

        // Series 생성
        Series series = new Series();
        series.setSeriesTitle(seriesTitle);
        series.setLibrary(library);

        return seriesRepository.save(series);
    }

    @Transactional
    public void deleteSeries(Long seriesId) {
        boolean exits = seriesRepository.existsById(seriesId);
        if (!exits) {
            throw new IllegalArgumentException("Series not found");
        }

        // TODO : 본인이 만든 series인지 확인 필요.
        
        seriesRepository.deleteById(seriesId);
    }

}
