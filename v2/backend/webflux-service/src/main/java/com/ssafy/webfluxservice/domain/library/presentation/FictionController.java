package com.ssafy.webfluxservice.domain.library.presentation;

import com.ssafy.webfluxservice.domain.library.presentation.dto.request.fiction.FictionArtCreateReq;
import com.ssafy.webfluxservice.domain.library.presentation.dto.request.fiction.FictionContentCreateReq;
import com.ssafy.webfluxservice.domain.library.service.FictionService;
import com.ssafy.webfluxservice.global.response.success.SuccessResponse;
import com.ssafy.webfluxservice.global.util.UserUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/fictions")
@RequiredArgsConstructor
public class FictionController {

    private final FictionService fictionService;
    private final UserUtil userUtil;

    // 소설 내용 생성
    @PostMapping("/content")
    public Mono<SuccessResponse> createFictionContent(
        @RequestBody @Valid FictionContentCreateReq fictionContentCreateReq,
        ServerHttpRequest request
    ) {
        Long libraryId = userUtil.getLibraryId(request);

        return userUtil.getCurrentUser(request)
            .flatMap(user -> {
                log.info("user {} creates fiction content", user.getId());
                return fictionService.getFictionContentAI(user, libraryId, fictionContentCreateReq);
            })
            .map(res -> SuccessResponse.success(200, res));
    }

    // 소설 그림 생성
    @PostMapping("/art")
    public Mono<SuccessResponse> createFictionArt(
        @RequestBody @Valid FictionArtCreateReq fictionArtCreateReq,
        ServerHttpRequest request
    ) {
        return userUtil.getCurrentUser(request)
            .flatMap(user -> {
                log.info("user {} creates fiction image", user.getId());
                return fictionService.getFictionArtAI(fictionArtCreateReq);
            })
            .map(res -> SuccessResponse.success(200, res));
    }
}
