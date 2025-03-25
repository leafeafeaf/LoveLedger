package com.ssafy.loveledger.domain.library.domain.repository;

import com.ssafy.loveledger.domain.library.domain.Diary;
import com.ssafy.loveledger.domain.library.domain.Library;
import com.ssafy.loveledger.domain.library.presentation.dto.response.diary.DiaryReadAllResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Long> {

    // Library 객체를 기반으로 DTO 변환하여 조회
    @Query(
        "SELECT new com.ssafy.loveledger.domain.library.presentation.dto.response.diary.DiaryReadAllResponse("
            +
            "d.id ,d.title, d.content, d.targetDate, d.createdAt, d.updatedAt) " +
            "FROM Diary d WHERE d.library = :library")
    Page<DiaryReadAllResponse> findByLibrary(@Param("library") Library library,
        Pageable pageable);
}
