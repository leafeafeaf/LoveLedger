package com.ssafy.loveledger.domain.library.domain.repository;

import com.ssafy.loveledger.domain.library.domain.Theme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, Long> {
}
