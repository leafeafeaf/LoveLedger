package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.presentation.dto.request.fiction.FictionAllCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.fiction.FictionArtCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.fiction.FictionContentCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.fiction.FictionAllReadResponse;
import com.ssafy.loveledger.domain.library.presentation.dto.response.fiction.FictionArtReadRes;
import com.ssafy.loveledger.domain.library.presentation.dto.response.fiction.FictionContentReadRes;
import com.ssafy.loveledger.domain.library.presentation.dto.response.fiction.FictionDetailReadResponse;
import com.ssafy.loveledger.domain.library.service.FictionService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.util.UserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/fictions")
@RequiredArgsConstructor
public class FictionController {

    private final FictionService fictionService;
    private final UserUtil userUtil;

    // 소설 내용 생성
    @PostMapping("/content")
    public FictionContentReadRes createFictionContent(
        @RequestBody @Valid FictionContentCreateReq fictionContentCreateReq) {
        User user = userUtil.getCurrentUser();

        log.info("user {} creates fiction content", user.getId());

        return fictionService.getFictionContentAI(user, fictionContentCreateReq);
    }

    // 소설 그림 생성
    @PostMapping("/art")
    public FictionArtReadRes createFictionArt(
        @RequestBody @Valid FictionArtCreateReq fictionArtCreateReq) {
        User user = userUtil.getCurrentUser();

        log.info("user {} creates fiction image", user.getId());

        return fictionService.getFictionArtAI(fictionArtCreateReq);
    }

    // 소설 전체 생성
    @PostMapping
    public void createFiction(
        @RequestBody @Valid FictionAllCreateRequest fictionCreateReq) {
        User user = userUtil.getCurrentUser();

        log.info("user {} creates fiction all", user.getId());

        fictionService.createFiction(fictionCreateReq);
    }

    //소설 삭제
    @DeleteMapping("/{fictionId}")
    public void deleteSeries(@PathVariable Long fictionId) {
        User user = userUtil.getCurrentUser();

        log.info("user {} delete fiction", user.getId());

        fictionService.deleteSeries(user, fictionId);
    }

    //시리즈 전체(소설 포함) 조회
    @GetMapping
    public Page<FictionAllReadResponse> readFictions(
        @RequestParam(defaultValue = "1") int pageNo,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "ASC") String sort
    ) {
        User user = userUtil.getCurrentUser();

        log.info("user {} read fictions", user.getId());

        return fictionService.readAllFiction(user, pageNo, size, sort);

    }

    // 소설 상세 조회
    @GetMapping("/{fictionId}")
    public FictionDetailReadResponse readFiction(
        @PathVariable Long fictionId) {
        User user = userUtil.getCurrentUser();

        log.info("user {} read fiction", user.getId());

        return fictionService.readFiction(user, fictionId);
    }
}
