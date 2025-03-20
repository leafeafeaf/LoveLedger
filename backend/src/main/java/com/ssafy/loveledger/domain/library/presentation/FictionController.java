package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionArtCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionContentCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionArtReadRes;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionContentReadRes;
import com.ssafy.loveledger.domain.library.service.FictionService;
import com.ssafy.loveledger.domain.library.service.SeriesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/fictions")
@RequiredArgsConstructor
public class FictionController {

    private final FictionService fictionService;
    private final SeriesService seriesService;

    // 소설 내용 생성
    @PostMapping("/content")
    public ResponseEntity<?> createFictionContent(@RequestBody FictionContentCreateReq fictionContentCreateReq) {

        FictionContentReadRes fictionReadDTO = fictionService.createFictionContent(fictionContentCreateReq);

        return ResponseEntity.ok(fictionReadDTO);
    }

    // 소설 그림 생성
    @PostMapping("/art")
    public ResponseEntity<?> createFictionArt(@RequestBody FictionArtCreateReq fictionContentArtReq) {

        FictionArtReadRes fictionArtReadDTO = fictionService.createFictionArt(fictionContentArtReq);

        return ResponseEntity.ok(fictionArtReadDTO);
    }

    // 소설 전체 생성
    @PostMapping
    public ResponseEntity<?> createFiction(@RequestBody FictionCreateReq fictionCreateReq) {

        fictionService.createFiction(fictionCreateReq);

        return ResponseEntity.ok("소설 생성 완료");
    }

    //소설 삭제
    @DeleteMapping("/{fictionId}")
    public ResponseEntity<?> deleteSeries(@PathVariable Long fictionId) {
        fictionService.deleteSeries(fictionId);
        return ResponseEntity.ok("소설 삭제완료 {fictionId} : " + fictionId);
    }

    //시리즈 전체(소설 포함) 조회
    @GetMapping
    public ResponseEntity<?> getFictions(
        @RequestParam(defaultValue = "1") int pageNo,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "ASC") String sort
    ) {
        Map<String, Object> data = fictionService.readSeries(pageNo, size, sort);

        // TODO : 응답 메세지 복구
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "시리즈 정보가 성공적으로 조회되었습니다.");
        response.put("data", data);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(response);
    }

    // 소설 상세 조회
    @GetMapping("/{fictionId}")
    public ResponseEntity<?> getFiction(@PathVariable Long fictionId) {

        Map<String, Object> data = fictionService.readFiction(fictionId);

        // TODO : 응답 메세지 복구
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "정상적으로 반환하였습니다.");
        response.put("data", data);
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(response);
    }
}
