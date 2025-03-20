package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.library.domain.Fiction;
import com.ssafy.loveledger.domain.library.domain.Series;
import com.ssafy.loveledger.domain.library.domain.Theme;
import com.ssafy.loveledger.domain.library.domain.repository.FictionRepository;
import com.ssafy.loveledger.domain.library.domain.repository.SeriesRepository;
import com.ssafy.loveledger.domain.library.domain.repository.ThemeRepository;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionArtCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionContentCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionArtReadRes;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionContentReadRes;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FictionService {

    private final ThemeRepository themeRepository;
    private final FictionRepository fictionRepository;
    private final SeriesRepository seriesRepository;

    // 소설 내용 생성
    @Transactional
    public FictionContentReadRes createFictionContent(FictionContentCreateReq fictionContentCreateReq) {

        Long themeId = fictionContentCreateReq.getThemeId();
        Long seriesId = fictionContentCreateReq.getSeriesId();
        LocalDate startDate = fictionContentCreateReq.getStartDate();
        LocalDate endDate = fictionContentCreateReq.getEndDate();

//        // TODO : error 메시지 변경
//        Series series = seriesRepository.findById(seriesId)
//            .orElseThrow(() -> new IllegalArgumentException("요청한 시리즈가 존재하지 않습니다."));
//
//        // 날짜 유효성 체크
//        // TODO : error 메시지 변경
//        if (startDate.isAfter(endDate)) {
//            throw new IllegalArgumentException("시작 날짜가 끝 날짜보다 이후일 수 없습니다.");
//        }
//
//        // Theme 검증
//        // TODO : error 메시지 변경
//        Theme theme = themeRepository.findById(themeId)
//            .orElseThrow(() -> new IllegalArgumentException("요청한 테마가 존재하지 않습니다."));

        // 소설 내용 생성
        // TODO : 챗지피티 연결
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

        String content = fictionContentArtReq.getContent();
        Long themeId = fictionContentArtReq.getThemeId();
        String title = fictionContentArtReq.getTitle();

        // 소설 그림 생성
        String imageUrl = "http://aiaiaiai.com";

//        // Theme 검증
//        // TODO : error 메시지 변경
//        Theme theme = themeRepository.findById(themeId)
//            .orElseThrow(() -> new IllegalArgumentException("요청한 테마가 존재하지 않습니다."));

        return FictionArtReadRes.builder()
            .imageUrl(imageUrl)
            .build();
    }

    // 소설 생성
    @Transactional
    public void createFiction(FictionCreateReq fictionCreateReq) {

        String content = fictionCreateReq.getContent();
        String title = fictionCreateReq.getTitle();
        String imageUrl = fictionCreateReq.getImageUrl();
        LocalDate startDate = fictionCreateReq.getStartDate();
        LocalDate endDate = fictionCreateReq.getEndDate();
        Long seriesId = fictionCreateReq.getSereisId();
        Long themeId = fictionCreateReq.getThemeId();

//        // TODO : error 메시지 변경
//        Series series = seriesRepository.findById(seriesId)
//            .orElseThrow(() -> new IllegalArgumentException("요청한 시리즈가 존재하지 않습니다.(seriesId : " + seriesId + ")"));
//
//        // 날짜 유효성 체크
//        // TODO : error 메시지 변경
//        if (startDate.isAfter(endDate)) {
//            throw new IllegalArgumentException("시작 날짜가 끝 날짜보다 이후일 수 없습니다.");
//        }
//
//        // Theme 검증
//        // TODO : error 메시지 변경
//        Theme theme = themeRepository.findById(themeId)
//            .orElseThrow(() -> new IllegalArgumentException("요청한 테마가 존재하지 않습니다.(themeId : " + themeId + ")"));

        Fiction fiction = new Fiction();
        fiction.setTitle(title);
        fiction.setArtURL(imageUrl);
        fiction.setContent(content);
        fiction.setStartDate(startDate);
        fiction.setEndDate(endDate);
        fiction.setTheme(Theme.builder().id(themeId).build());
        fiction.setSeries(Series.builder().id(seriesId).build());
        fictionRepository.save(fiction);

    }

    // 소설 삭제
    @Transactional
    public void deleteSeries(Long fictionId) {

        boolean exits = fictionRepository.existsById(fictionId);
        if (!exits) {
            throw new IllegalArgumentException("해당 소설이 없습니다");
        }

        fictionRepository.deleteById(fictionId);
    }

    // 시리즈별 소설 전부 조회
    @Transactional
    public Map<String, Object> readSeries(int pageNo, int size, String sort) {

        Sort.Direction direction = sort.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNo - 1, size, Sort.by(direction, "id"));

        Page<Series> seriesPage = seriesRepository.findAll(pageable);

        // TODO : 에러 메시지 바꾸기
//        if(seriesPage.isEmpty()) {
//            throw new IllegalArgumentException("조회 가능한 시리즈가 없습니다.");
//        }

        List<Map<String, Object>> seriesList = new ArrayList<>();

        for (Series series : seriesPage.getContent()) {
            Map<String, Object> seriesMap = new HashMap<>();

            seriesMap.put("seriesid", series.getId());
            seriesMap.put("seriesname", series.getSeriesTitle());

            //소설 리스트 구성
            List<Map<String, Object>> fictionList = new ArrayList<>();
            for (Fiction fiction : series.getFiction()) {
                Map<String, Object> fictionMap = new HashMap<>();

                fictionMap.put("title", fiction.getTitle());
                fictionMap.put("artUrl", fiction.getArtURL());
                fictionMap.put("createat", fiction.getCreatedAt());

                fictionList.add(fictionMap);
            }
            seriesMap.put("fictions", fictionList);

            seriesList.add(seriesMap);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("series", seriesList);

        return response;
    }

    // 소설 상세 조회
    @Transactional
    public Map<String, Object> readFiction(Long fictionId) {

        Fiction fiction = fictionRepository.findById(fictionId).orElse(null);

//        if (fiction == null) {
//            throw new IllegalArgumentException("요청한 소설을 찾을 수 없습니다. (fictionId=" + fictionId + ")");
//        }

        Map<String, Object> response = new HashMap<>();
        response.put("createdAt", fiction.getCreatedAt());
        response.put("title", fiction.getTitle());
        response.put("artUrl", fiction.getArtURL());
        response.put("content", fiction.getContent());

        return response;
    }
}
