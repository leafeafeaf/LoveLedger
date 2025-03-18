package com.ssafy.loveledger.domain.user.domain.repository;

import com.ssafy.loveledger.domain.user.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByProviderAndUsercode(String provider, String username);
}
