package com.ssafy.webfluxservice.domain.history.domain.repository;

import com.ssafy.webfluxservice.domain.history.domain.History;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface HistoryRepository extends ReactiveCrudRepository<History, Long> {

    Flux<History> findByAccountIdAndCreatedDate(String accountId, LocalDate date);

    Flux<History> findByAccountIdInAndCreatedDateBetween(List<String> accountIds,
        LocalDate startDate, LocalDate endDate);
}
