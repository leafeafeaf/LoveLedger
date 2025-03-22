package com.ssafy.loveledger.domain.user.domain.repository;

import com.ssafy.loveledger.domain.user.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByProviderAndUsercode(String provider, String username);

    //Lazy를 대비해서 유저와 함께 account list를 한번에 불러오기
    @EntityGraph(attributePaths = {"account"})
    Optional<User> findWithAccountsById(Long userId);
}