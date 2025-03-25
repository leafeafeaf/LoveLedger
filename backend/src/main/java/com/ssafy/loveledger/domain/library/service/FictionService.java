package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.library.domain.Fiction;
import com.ssafy.loveledger.domain.library.domain.Library;
import com.ssafy.loveledger.domain.library.domain.Series;
import com.ssafy.loveledger.domain.library.domain.repository.FictionRepository;
import com.ssafy.loveledger.domain.library.domain.repository.LibraryRepository;
import com.ssafy.loveledger.domain.library.domain.repository.SeriesRepository;
import com.ssafy.loveledger.domain.library.domain.repository.ThemeRepository;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionAllCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionArtCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionContentCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.*;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FictionService {

    private final ThemeRepository themeRepository;
    private final FictionRepository fictionRepository;
    private final SeriesRepository seriesRepository;
    private final LibraryRepository libraryRepository;

    // 소설 내용 생성
    @Transactional
    public FictionContentReadRes createFictionContent(FictionContentCreateReq fictionContentCreateReq) {

        // TODO : 챗지피티 연결
        Long themeId = fictionContentCreateReq.getThemeId();
        Long seriesId = fictionContentCreateReq.getSeriesId();
        LocalDate startDate = fictionContentCreateReq.getStartDate();
        LocalDate endDate = fictionContentCreateReq.getEndDate();

        // series 있는지 확인
        seriesRepository.findById(seriesId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.SERIES_NOT_FOUND, String.valueOf(seriesId)));

        // Theme 검증
        themeRepository.findById(themeId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.THEME_NOT_FOUND, String.valueOf(themeId)));

        // 소설 내용 생성
        String content = "나나나";
        String title = "누누누";

        return FictionContentReadRes.builder()
            .content(content)
            .title(title)
            .build();
    }

    // 소설 그림 생성
    @Transactional
    public FictionArtReadRes createFictionArt(FictionArtCreateReq fictionContentArtReq) {

        // TODO : 소설 그림 생성
        String content = fictionContentArtReq.getContent();
        Long themeId = fictionContentArtReq.getThemeId();
        String title = fictionContentArtReq.getTitle();

        // 소설 그림 생성
        String imageUrl = "http://aiaiaiai.com";

        // Theme 검증
        themeRepository.findById(themeId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.THEME_NOT_FOUND, String.valueOf(themeId)));

        return FictionArtReadRes.builder()
            .imageUrl(imageUrl)
            .build();
    }

    // 소설 생성
    @Transactional
    public void createFiction(FictionAllCreateRequest fictionCreateReq) {

        Fiction fiction = Fiction.builder()
            .series(Series.builder().id(fictionCreateReq.getSereisId()).build())
            .Title(fictionCreateReq.getTitle())
            .artURL(fictionCreateReq.getImageUrl())
            .content(fictionCreateReq.getContent())
            .startDate(fictionCreateReq.getStartDate())
            .endDate(fictionCreateReq.getEndDate())
            .build();

        fictionRepository.save(fiction);

    }

    // 소설 삭제
    @Transactional
    public void deleteSeries(Long LibraryId, Long fictionId) {

        // 소설 Id로 소설 존재 여부 확인
        Fiction fiction = fictionRepository.findById(fictionId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.SERIES_NOT_FOUND, String.valueOf(fictionId)));

        if (!fiction.getSeries().getLibrary().getId().equals(LibraryId)) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS);
        }

        fictionRepository.deleteById(fictionId);
    }

    // 시리즈별 소설 전부 조회
    @Transactional
    public Page<FictionAllReadResponse> readAllFiction(Long libraryId, int pageNo, int size, String sort) {

        // 사용자 체크
        libraryRepository.findById(libraryId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS));

        // 정렬 방식 설정
        Sort.Direction direction =
            sort.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Pageable 객체 생성 (페이지 번호는 0부터 시작해야 하므로 pageno - 1)
        Pageable pageable = PageRequest.of(pageNo - 1, size, Sort.by(direction, "id"));

        Page<Series> seriesPage = seriesRepository.findByLibraryId(libraryId, pageable);

        return seriesPage.map(series -> {
            List<FictionReadResponse> fictionDtos = series.getFiction().stream()
                .map(fiction -> FictionReadResponse.builder()
                    .fictionId(fiction.getId())
                    .title(fiction.getTitle())
                    .artUrl(fiction.getArtURL())
                    .createdAt(fiction.getCreatedAt())
                    .build())
                .toList();

            return FictionAllReadResponse.builder()
                .seriesId(series.getId())
                .seriesName(series.getTitle())
                .fictions(fictionDtos)
                .build();
        });
    }

    // 소설 상세 조회
    @Transactional
    public FictionDetailReadResponse readFiction(Long libraryId, Long fictionId) {

        // 사용자 체크
        Library library = libraryRepository.findById(libraryId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS));

        // 소설 여부 체크
        Fiction fiction = fictionRepository.findById(fictionId).orElseThrow(
            () -> new LoveLedgerException(ErrorCode.FICTION_NOT_FOUND, String.valueOf(fictionId)));

        return FictionDetailReadResponse.builder()
            .title(fiction.getTitle())
            .content(fiction.getContent())
            .artUrl(fiction.getArtURL())
            .createdAt(fiction.getCreatedAt())
            .build();
    }
}
