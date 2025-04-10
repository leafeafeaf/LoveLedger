package com.ssafy.mvcservice.domain.library.domain.repository;

import com.ssafy.mvcservice.domain.library.domain.Series;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeriesRepository extends JpaRepository<Series, Long> {
    Page<Series> findByLibraryId(Long userId, Pageable pageable);

}
