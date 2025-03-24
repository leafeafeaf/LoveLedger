package com.ssafy.loveledger.domain.couple.domain.repository;

import com.ssafy.loveledger.domain.couple.domain.Couple;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CoupleRepository extends JpaRepository<Couple, Long> {

    @Query("SELECT c FROM Couple c WHERE c.husbandId = :userId OR c.wifeId = :userId")
    Optional<Couple> findByUserId(@Param("userId") Long userId);

    // 남편 ID로 부부 정보 찾기
    Optional<Couple> findByHusbandId(Long husbandId);

    // 아내 ID로 부부 정보 찾기
    Optional<Couple> findByWifeId(Long wifeId);
}
