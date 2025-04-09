package com.ssafy.loveledger.domain.library.domain.repository;

import com.ssafy.loveledger.domain.library.domain.Fiction;
import com.ssafy.loveledger.domain.library.presentation.dto.request.fiction.FictionReadRequest;
import feign.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FictionRepository extends JpaRepository<Fiction, Long> {

    @Query("SELECT new com.ssafy.loveledger.domain.library.presentation.dto.request.fiction.FictionReadRequest(f.Title, f.content) " +
        "FROM Fiction f WHERE f.series.id = :seriesId ORDER BY f.createdAt DESC")
    List<FictionReadRequest> findTop10BySeriesId(@Param("seriesId") Long seriesId, Pageable pageable);
}
