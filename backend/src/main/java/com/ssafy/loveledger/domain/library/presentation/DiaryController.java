package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.presentation.dto.request.diary.DiaryCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.diary.DiaryUpdateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.diary.UpdateHistoryRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.response.diary.DiaryReadAllResponse;
import com.ssafy.loveledger.domain.library.presentation.dto.response.diary.DiaryReadResponse;
import com.ssafy.loveledger.domain.library.service.DiaryService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.global.util.UserUtil;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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
    private final UserUtil userUtil;

    @PostMapping
    public void createDiary(@RequestBody @Valid DiaryCreateRequest diaryCreateRequest) {
        User user = userUtil.getCurrentUser();
        log.info("user {} creates diary", user.getId());

        diaryService.createDiary(user, diaryCreateRequest);
    }

    @GetMapping
    public Page<DiaryReadAllResponse> readAllDiary(
        @RequestParam(defaultValue = "1") int pageno,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "DESC") String sort
    ) {
        User user = userUtil.getCurrentUser();
        log.info("user {} reads all diary", user.getId());

        return diaryService.readAllDiary(user, pageno,
            size, sort);
    }


    @GetMapping("/{diaryId}")
    public DiaryReadResponse readDiary(@PathVariable long diaryId) {
        User user = userUtil.getCurrentUser();
        log.info("user {} reads diary {}", user.getId(), diaryId);
        return diaryService.readDiary(user, diaryId);

    }

    @PatchMapping("/{diaryId}")
    public void updateDiary(@PathVariable long diaryId,
        @RequestBody @Valid DiaryUpdateRequest diaryUpdateRequest) {
        User user = userUtil.getCurrentUser();

        log.info("user {} updates diary {}", user.getId(), diaryId);

        diaryService.updateDiary(user, diaryId, diaryUpdateRequest);
    }

    @DeleteMapping("/{diaryId}")
    public void deleteDiary(@PathVariable long diaryId) {
        User user = userUtil.getCurrentUser();

        log.info("user {} removes diary {}", user.getId(), diaryId);

        diaryService.deleteDiary(user, diaryId);
    }

    @PostMapping("/{diaryId}/history")
    public CompletableFuture<Map<String, Object>> getEditHistoryList(
        @PathVariable long diaryId) {
        User user = userUtil.getCurrentUser();

        log.info("user {} starts edit history with diary {}", user.getId(), diaryId);

        return diaryService.getEditHistoryList(user, diaryId)
            .thenApply(historyList ->
                historyList);
    }

    @PatchMapping("/history")
    public void editHistory(
        @RequestBody @Valid UpdateHistoryRequest updateHistoryRequest) {
        User user = userUtil.getCurrentUser();

        log.info("user {} edits histories", user.getId());

        diaryService.editHistory(user, updateHistoryRequest);
    }
}
