package com.ssafy.mvcservice.domain.library.domain.repository;

import com.ssafy.mvcservice.domain.library.domain.Library;
import com.ssafy.mvcservice.domain.user.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryRepository extends JpaRepository<Library, Long> {

    Library findFirstByUserId(Long userId);

    // User 객체로 Library 찾기
    Optional<Library> findByUser(User user);

    Optional<Library> findByUserId(Long userId);
}
