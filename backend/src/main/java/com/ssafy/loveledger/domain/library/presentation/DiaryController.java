package com.ssafy.loveledger.domain.library.presentation;

import com.ssafy.loveledger.domain.library.domain.Library;
import com.ssafy.loveledger.domain.library.presentation.dto.request.DiaryCreateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.DiaryUpdateRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.request.UpdateHistoryRequest;
import com.ssafy.loveledger.domain.library.presentation.dto.response.DiaryReadAllResponse;
import com.ssafy.loveledger.domain.library.presentation.dto.response.DiaryReadResponse;
import com.ssafy.loveledger.domain.library.service.DiaryService;
import com.ssafy.loveledger.domain.user.domain.User;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    //테스트 유저 객체
    User user = User.builder().id(1L).library(Library.builder().id(1L).build()).build();

    @PostMapping
    public ResponseEntity<?> createDiary(
        @RequestBody @Valid DiaryCreateRequest diaryCreateRequest) {
        //TODO 유저 객체 인증정보에서 꺼내기

        diaryService.createDiary(user, diaryCreateRequest);

        //TODO 표준 응답처리 및 에러 처리 필요
        return ResponseEntity.ok("생성 성공");
    }

    @GetMapping
    public ResponseEntity<?> readAllDiary(
        @RequestParam(defaultValue = "1") int pageno,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "DESC") String sort
    ) {
        //TODO 유저 객체 인증정보에서 꺼내기

        Page<DiaryReadAllResponse> diaries = diaryService.readAllDiary(user, pageno, size, sort);

        return ResponseEntity.ok(diaries);
    }

    @GetMapping("/{diaryId}")
    public ResponseEntity<?> readDiary(@PathVariable long diaryId) {
        //TODO 유저 객체 인증정보에서 꺼내기

        DiaryReadResponse diaryReadResponse = diaryService.readDiary(user, diaryId);

        //TODO 표준 응답처리 및 에러 처리 필요
        return ResponseEntity.ok(diaryReadResponse);
    }

    @PatchMapping("/{diaryId}")
    public ResponseEntity<?> updateDiary(@PathVariable long diaryId, @RequestBody @Valid
    DiaryUpdateRequest diaryUpdateRequest) {
        //TODO 유저 객체 인증정보에서 꺼내기

        diaryService.updateDiary(user, diaryId, diaryUpdateRequest);

        //TODO 표준 응답처리 및 에러 처리 필요
        return ResponseEntity.ok("수정 완료");
    }

    @DeleteMapping("/{diaryId}")
    public ResponseEntity<?> deleteDiary(@PathVariable long diaryId) {
        //TODO 유저 객체 인증정보에서 꺼내기

        diaryService.deleteDiary(user, diaryId);

        //TODO 표준 응답처리 및 에러 처리 필요
        return ResponseEntity.ok("삭제완료");
    }

    @PostMapping("/{diaryId}/history")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> getEditHistoryList(
        @PathVariable long diaryId) {

        CompletableFuture<Map<String, Object>> map = diaryService.getEditHistoryList(user, diaryId);

        return diaryService.getEditHistoryList(user, diaryId)
            .thenApply(ResponseEntity::ok);
    }

    @PatchMapping("/history")
    public ResponseEntity<?> editHistory(@RequestBody UpdateHistoryRequest updateHistoryRequest) {
        //TODO 유저 정보 불러오기
        diaryService.editHistory(user, updateHistoryRequest);

        return ResponseEntity.ok("수정 완료");
    }
}
