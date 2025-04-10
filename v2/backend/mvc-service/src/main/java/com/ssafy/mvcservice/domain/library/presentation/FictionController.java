package com.ssafy.mvcservice.domain.library.presentation;

import com.ssafy.mvcservice.domain.library.presentation.dto.request.fiction.FictionAllCreateRequest;
import com.ssafy.mvcservice.domain.library.presentation.dto.request.fiction.FictionArtCreateReq;
import com.ssafy.mvcservice.domain.library.presentation.dto.request.fiction.FictionContentCreateReq;
import com.ssafy.mvcservice.domain.library.presentation.dto.response.fiction.FictionAllReadResponse;
import com.ssafy.mvcservice.domain.library.presentation.dto.response.fiction.FictionArtReadRes;
import com.ssafy.mvcservice.domain.library.presentation.dto.response.fiction.FictionContentReadRes;
import com.ssafy.mvcservice.domain.library.presentation.dto.response.fiction.FictionDetailReadResponse;
import com.ssafy.mvcservice.domain.library.service.FictionService;
import com.ssafy.mvcservice.domain.user.domain.User;
import com.ssafy.mvcservice.global.util.UserUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
        @RequestBody @Valid FictionContentCreateReq fictionContentCreateReq,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} creates fiction content", user.getId());

        return fictionService.getFictionContentAI(user, fictionContentCreateReq);
    }

    // 소설 그림 생성
    @PostMapping("/art")
    public FictionArtReadRes createFictionArt(
        @RequestBody @Valid FictionArtCreateReq fictionArtCreateReq,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} creates fiction image", user.getId());

        return fictionService.getFictionArtAI(fictionArtCreateReq);
    }

    // 소설 전체 생성
    @PostMapping
    public void createFiction(
        @RequestBody @Valid FictionAllCreateRequest fictionCreateReq,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} creates fiction all", user.getId());

        fictionService.createFiction(fictionCreateReq);
    }

    //소설 삭제
    @DeleteMapping("/{fictionId}")
    public void deleteSeries(@PathVariable Long fictionId,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} delete fiction", user.getId());

        fictionService.deleteSeries(user, fictionId);
    }

    //시리즈 전체(소설 포함) 조회
    @GetMapping
    public Page<FictionAllReadResponse> readFictions(
        @RequestParam(defaultValue = "1") int pageNo,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "ASC") String sort,
        HttpServletRequest request
    ) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} read fictions", user.getId());

        return fictionService.readAllFiction(user, pageNo, size, sort);

    }

    // 소설 상세 조회
    @GetMapping("/{fictionId}")
    public FictionDetailReadResponse readFiction(
        @PathVariable Long fictionId,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        log.info("user {} read fiction", user.getId());

        return fictionService.readFiction(user, fictionId);
    }
}
