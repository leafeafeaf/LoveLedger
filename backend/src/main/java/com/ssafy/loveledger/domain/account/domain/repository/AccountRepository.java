package com.ssafy.loveledger.domain.account.domain.repository;

import com.ssafy.loveledger.domain.account.domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

}
