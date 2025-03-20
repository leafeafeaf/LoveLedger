package com.ssafy.loveledger.domain.library.domain.repository;

import com.ssafy.loveledger.domain.library.domain.Fiction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FictionRepository extends JpaRepository<Fiction, Long> {

}
