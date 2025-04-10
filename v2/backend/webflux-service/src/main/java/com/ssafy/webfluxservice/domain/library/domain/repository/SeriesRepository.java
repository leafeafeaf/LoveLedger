package com.ssafy.webfluxservice.domain.library.domain.repository;

import com.ssafy.webfluxservice.domain.library.domain.Series;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeriesRepository extends ReactiveCrudRepository<Series, Long> {

}
