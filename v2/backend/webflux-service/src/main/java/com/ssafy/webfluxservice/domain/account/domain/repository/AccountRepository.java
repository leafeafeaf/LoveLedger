package com.ssafy.webfluxservice.domain.account.domain.repository;

import com.ssafy.webfluxservice.domain.account.domain.Account;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface AccountRepository extends ReactiveCrudRepository<Account, Long> {

    Flux<Account> findByUserId(Long userId);
}
