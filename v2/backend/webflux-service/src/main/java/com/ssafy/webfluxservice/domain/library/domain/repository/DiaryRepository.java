package com.ssafy.webfluxservice.domain.library.domain.repository;

import com.ssafy.webfluxservice.domain.library.domain.Diary;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaryRepository extends ReactiveCrudRepository<Diary, Long> {

}
