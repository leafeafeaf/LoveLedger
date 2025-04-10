package com.ssafy.webfluxservice.domain.library.domain.repository;

import com.ssafy.webfluxservice.domain.library.domain.Theme;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThemeRepository extends ReactiveCrudRepository<Theme, Long> {

}
