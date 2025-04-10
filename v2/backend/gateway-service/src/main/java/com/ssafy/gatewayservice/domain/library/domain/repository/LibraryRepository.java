package com.ssafy.gatewayservice.domain.library.domain.repository;

import com.ssafy.gatewayservice.domain.library.domain.Library;
import com.ssafy.gatewayservice.domain.user.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryRepository extends JpaRepository<Library, Long> {

    Optional<Library> findByUser(User existingUser);
}
