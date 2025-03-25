package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionAllCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionArtCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionContentCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionAllReadResponse;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionArtReadRes;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionContentReadRes;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionDetailReadResponse;
import com.ssafy.loveledger.domain.library.service.FictionService;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/fictions")
@RequiredArgsConstructor
public class FictionController {

    private final FictionService fictionService;

    // 소설 내용 생성
    @PostMapping("/content")
    public FictionContentReadRes createFictionContent(
        @AuthenticationPrincipal CustomOAuth2User user,
        @RequestBody @Valid FictionContentCreateReq fictionContentCreateReq) {

        log.info("user {} creates fiction content", user.getUserId());

        return fictionService.createFictionContent(fictionContentCreateReq);
    }

    // 소설 그림 생성
    @PostMapping("/art")
    public FictionArtReadRes createFictionArt(
        @AuthenticationPrincipal CustomOAuth2User user,
        @RequestBody @Valid FictionArtCreateReq fictionContentArtReq) {

        log.info("user {} creates fiction image", user.getUserId());

        return fictionService.createFictionArt(fictionContentArtReq);
    }

    // 소설 전체 생성
    @PostMapping
    public ResponseEntity<ApiResponse> createFiction(
        @AuthenticationPrincipal CustomOAuth2User user,
        @RequestBody @Valid FictionAllCreateRequest fictionCreateReq) {

        log.info("user {} creates fiction all", user.getUserId());

        fictionService.createFiction(fictionCreateReq);

        return ResponseEntity.ok(ApiResponse.success("소설 생성 완료", null));
    }

    //소설 삭제
    @DeleteMapping("/{fictionId}")
    public ResponseEntity<ApiResponse> deleteSeries(@AuthenticationPrincipal CustomOAuth2User user, @PathVariable Long fictionId) {

        log.info("user {} delete fiction", user.getLibraryId());

        fictionService.deleteSeries(user.getLibraryId(), fictionId);
        return ResponseEntity.ok(ApiResponse.success("소설 삭제 완료 {fictionId} : " + fictionId, null));
    }

    //시리즈 전체(소설 포함) 조회
    @GetMapping
    public Page<FictionAllReadResponse> readFictions(
        @AuthenticationPrincipal CustomOAuth2User user,
        @RequestParam(defaultValue = "1") int pageNo,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "ASC") String sort
    ) {
        log.info("user {} read fictions", user.getUserId());

        return fictionService.readAllFiction(user.getLibraryId(), pageNo, size, sort);

    }

    // 소설 상세 조회
    @GetMapping("/{fictionId}")
    public FictionDetailReadResponse readFiction(
        @AuthenticationPrincipal CustomOAuth2User user,
        @PathVariable Long fictionId) {

        log.info("user {} read fiction", user.getUserId());

        return fictionService.readFiction(user.getLibraryId(), fictionId);
    }
}
