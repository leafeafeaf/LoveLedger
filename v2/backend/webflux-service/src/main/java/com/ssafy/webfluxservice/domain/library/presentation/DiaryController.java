package com.ssafy.webfluxservice.domain.library.presentation;

import com.ssafy.webfluxservice.domain.library.service.DiaryService;
import com.ssafy.webfluxservice.global.response.success.SuccessResponse;
import com.ssafy.webfluxservice.global.util.UserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/diary")
@RequiredArgsConstructor
@Slf4j
public class DiaryController {

    private final DiaryService diaryService;
    private final UserUtil userUtil;

    @PostMapping("/{diaryId}/history")
    public Mono<SuccessResponse> getEditHistoryList(
        @PathVariable long diaryId,
        ServerHttpRequest request
    ) {
        Long libraryId = userUtil.getLibraryId(request);

        return userUtil.getCurrentUser(request)
            .flatMap(user -> {
                log.info("user {} starts edit history with diary {}", user.getId(), diaryId);

                return diaryService.getEditHistoryList(user, libraryId, diaryId);
            })
            .map(result -> SuccessResponse.success(200, result));
    }
}
