package com.ssafy.webfluxservice.domain.library.domain.repository;

import com.ssafy.webfluxservice.domain.library.domain.Fiction;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface FictionRepository extends ReactiveCrudRepository<Fiction, Long> {

    @Query("SELECT * FROM fiction WHERE series_id = :seriesId ORDER BY created_at DESC LIMIT 10")
    Flux<Fiction> findTop10BySeriesId(Long seriesId);
}
