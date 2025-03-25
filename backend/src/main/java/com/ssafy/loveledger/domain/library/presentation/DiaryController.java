package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.presentation.dto.request.DiaryCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.DiaryUpdateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.UpdateHistoryRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.response.DiaryReadAllResponse;
import com.ssafy.loveledger.domain.library.presentation.dto.response.DiaryReadResponse;
import com.ssafy.loveledger.domain.library.service.DiaryService;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping
    public ResponseEntity<ApiResponse> createDiary(
        @RequestBody @Valid DiaryCreateRequest diaryCreateRequest,
        @AuthenticationPrincipal CustomOAuth2User user) {

        log.info("user {} creates diary", user.getUserId());

        diaryService.createDiary(user.getLibraryId(), diaryCreateRequest);

        return ResponseEntity.ok(ApiResponse.success("일기가 정상적으로 작성되었습니다.", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> readAllDiary(
        @RequestParam(defaultValue = "1") int pageno,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "DESC") String sort,
        @AuthenticationPrincipal CustomOAuth2User user
    ) {
        log.info("user {} reads all diary", user.getUserId());

        Page<DiaryReadAllResponse> diaries = diaryService.readAllDiary(user.getLibraryId(), pageno,
            size, sort);

        return ResponseEntity.ok(ApiResponse.success("일기가 정상적으로 반환되었습니다.", diaries));
    }


    @GetMapping("/{diaryId}")
    public ResponseEntity<ApiResponse> readDiary(@PathVariable long diaryId,
        @AuthenticationPrincipal CustomOAuth2User user) {
        log.info("user {} reads diary {}", user.getUserId(), diaryId);

        DiaryReadResponse diaryReadResponse = diaryService.readDiary(user.getLibraryId(), diaryId);

        return ResponseEntity.ok(ApiResponse.success("일기가 정상적으로 반환되었습니다.", diaryReadResponse));
    }

    @PatchMapping("/{diaryId}")
    public ResponseEntity<ApiResponse> updateDiary(@PathVariable long diaryId, @RequestBody @Valid
    DiaryUpdateRequest diaryUpdateRequest, @AuthenticationPrincipal CustomOAuth2User user) {
        log.info("user {} updates diary {}", user.getUserId(), diaryId);

        diaryService.updateDiary(user.getLibraryId(), diaryId, diaryUpdateRequest);

        return ResponseEntity.ok(ApiResponse.success("일기가 정상적으로 수정되었습니다.", null));
    }

    @DeleteMapping("/{diaryId}")
    public ResponseEntity<ApiResponse> deleteDiary(@PathVariable long diaryId,
        @AuthenticationPrincipal CustomOAuth2User user) {
        log.info("user {} removes diary {}", user.getUserId(), diaryId);

        diaryService.deleteDiary(user.getLibraryId(), diaryId);

        return ResponseEntity.ok(ApiResponse.success("일기가 정상적으로 삭제되었습니다.", null));
    }

    @PostMapping("/{diaryId}/history")
    public CompletableFuture<ResponseEntity<ApiResponse>> getEditHistoryList(
        @PathVariable long diaryId,
        @AuthenticationPrincipal CustomOAuth2User user) {
        log.info("user {} starts edit history with diary {}", user.getUserId(), diaryId);

        return diaryService.getEditHistoryList(user.getUserId(), user.getLibraryId(), diaryId)
            .thenApply(historyList ->
                ResponseEntity.ok(ApiResponse.success("수정 내역을 성공적으로 가져왔습니다.", historyList))
            );
    }

    @PatchMapping("/history")
    public ResponseEntity<ApiResponse> editHistory(
        @RequestBody @Valid UpdateHistoryRequest updateHistoryRequest,
        @AuthenticationPrincipal CustomOAuth2User user) {
        log.info("user {} edits histories", user.getUserId());

        diaryService.editHistory(user.getUserId(), updateHistoryRequest);

        return ResponseEntity.ok(ApiResponse.success("수정 내역이 성공적으로 반영되었습니디.", null));
    }
}
