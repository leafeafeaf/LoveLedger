package com.ssafy.webfluxservice.domain.user.domain.repository;

import com.ssafy.webfluxservice.domain.user.domain.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends ReactiveCrudRepository<User, Long> {

}
