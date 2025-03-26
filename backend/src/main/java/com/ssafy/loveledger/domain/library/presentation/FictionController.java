package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.domain.repository.LibraryRepository;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionAllCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionArtCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.request.FictionContentCreateReq;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionAllReadResponse;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionArtReadRes;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionContentReadRes;
import com.ssafy.loveledger.domain.library.presentation.dto.response.FictionDetailReadResponse;
import com.ssafy.loveledger.domain.library.service.FictionService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final LibraryRepository libraryRepository;

    // 소설 내용 생성
    @PostMapping("/content")
    public FictionContentReadRes createFictionContent(
        @RequestBody @Valid FictionContentCreateReq fictionContentCreateReq) {
        User user = userUtil.getCurrentUser();

        // test
//        User user = userRepository.findById(1L).orElse(null);

        log.info("user {} creates fiction content", user.getId());

        return fictionService.createFictionContent(fictionContentCreateReq);
    }

    // 소설 그림 생성
    @PostMapping("/art")
    public FictionArtReadRes createFictionArt(
        @RequestBody @Valid FictionArtCreateReq fictionContentArtReq) {
        User user = userUtil.getCurrentUser();

        // test
//        User user = userRepository.findById(1L).orElse(null);

        log.info("user {} creates fiction image", user.getId());

        return fictionService.createFictionArt(fictionContentArtReq);
    }

    // 소설 전체 생성
    @PostMapping
    public void createFiction(
        @RequestBody @Valid FictionAllCreateRequest fictionCreateReq) {
        User user = userUtil.getCurrentUser();

        // test
//        User user = userRepository.findById(1L).orElse(null);

        log.info("user {} creates fiction all", user.getId());

        fictionService.createFiction(fictionCreateReq);
    }

    //소설 삭제
    @DeleteMapping("/{fictionId}")
    public void deleteSeries(@PathVariable Long fictionId) {
        User user = userUtil.getCurrentUser();

        // test
//        User user = userRepository.findById(1L).orElse(null);

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

        // test
//        User user = userRepository.findById(1L).orElse(null);

        log.info("user {} read fictions", user.getId());

        return fictionService.readAllFiction(user, pageNo, size, sort);

    }

    // 소설 상세 조회
    @GetMapping("/{fictionId}")
    public FictionDetailReadResponse readFiction(
        @PathVariable Long fictionId) {
        User user = userUtil.getCurrentUser();

        // test
//        User user = userRepository.findById(1L).orElse(null);

        log.info("user {} read fiction", user.getId());

        return fictionService.readFiction(user, fictionId);
    }
}
