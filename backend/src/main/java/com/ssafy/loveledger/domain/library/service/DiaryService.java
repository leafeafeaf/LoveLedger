package com.ssafy.loveledger.domain.library.service;

import com.ssafy.loveledger.domain.library.domain.Diary;
import com.ssafy.loveledger.domain.library.domain.repository.DiaryRepository;
import com.ssafy.loveledger.domain.library.domain.repository.LibraryRepository;
import com.ssafy.loveledger.domain.library.presentation.dto.request.DiaryCreateDTO;
import com.ssafy.loveledger.domain.library.presentation.dto.request.DiaryUpdateDTO;
import com.ssafy.loveledger.domain.library.presentation.dto.response.DiaryReadDTO;
import com.ssafy.loveledger.domain.user.domain.User;
import jakarta.validation.Valid;
import java.nio.file.AccessDeniedException;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final LibraryRepository libraryRepository;

    //TODO 전역 에러 처리 및 에러 메시지 표준화 필요
    public void createDiary(User user, @Valid DiaryCreateDTO diaryCreateDTO) {
        //Diary 생성
        Diary diary = Diary.builder()
            .library(user.getLibrary())
            .targetDate(diaryCreateDTO.getTargetDate())
            .title(diaryCreateDTO.getTitle())
            .content(diaryCreateDTO.getContent())
            .build();

        //일기 저장
        diaryRepository.save(diary);
    }

    public Page<DiaryReadDTO> readAllDiary(User user, int pageno, int size, String sort) {
        // 정렬 방식 결정 (DESC 기본값)
        Sort.Direction direction =
            sort.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Pageable 객체 생성 (페이지 번호는 0부터 시작해야 하므로 pageno - 1)
        Pageable pageable = PageRequest.of(pageno - 1, size, Sort.by(direction, "createdAt"));

        // 페이징 처리된 결과 반환
        return diaryRepository.findDiariesByLibrary(user.getLibrary(), pageable);
    }

    //TODO 전역 에러 처리 및 에러 메시지 표준화 필요
    public DiaryReadDTO readDiary(User user, long diaryId) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new NoSuchElementException("해당 일기 (ID: " + diaryId + ")를 찾을 수 없습니다."));

        //유저 서재인지 확인
        if (!diary.getLibrary().getId().equals(user.getLibrary().getId())) {
            try {
                throw new AccessDeniedException("해당 일기에 대한 접근 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        return DiaryReadDTO.builder()
            .title(diary.getTitle())
            .content(diary.getContent())
            .targetDate(diary.getTargetDate())
            .createdAt(diary.getCreatedAt())
            .updatedAt(diary.getUpdatedAt())
            .build();
    }

    //TODO 전역 에러 처리 및 에러 메시지 표준화 필요
    public void updateDiary(User user, long diaryId, @Valid DiaryUpdateDTO diaryUpdateDTO) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new NoSuchElementException("해당 일기 (ID: " + diaryId + ")를 찾을 수 없습니다."));

        //유저 서재인지 확인
        if (!diary.getLibrary().getId().equals(user.getLibrary().getId())) {
            try {
                throw new AccessDeniedException("해당 일기에 대한 접근 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        //수정
        diary.setTitle(diaryUpdateDTO.getTitle());
        diary.setContent(diaryUpdateDTO.getContent());

        diaryRepository.save(diary);
    }

    //TODO 전역 에러 처리 및 에러 메시지 표준화 필요
    public void deleteDiary(User user, long diaryId) {
        //다이어리를 기반으로 diary 검색
        Diary diary = diaryRepository.findById(diaryId).orElseThrow(
            () -> new NoSuchElementException("해당 일기 (ID: " + diaryId + ")를 찾을 수 없습니다."));

        //유저 서재인지 확인
        if (!diary.getLibrary().getId().equals(user.getLibrary().getId())) {
            try {
                throw new AccessDeniedException("해당 일기에 대한 접근 권한이 없습니다.");
            } catch (AccessDeniedException e) {
                throw new RuntimeException(e);
            }
        }

        diaryRepository.delete(diary);
    }


}
