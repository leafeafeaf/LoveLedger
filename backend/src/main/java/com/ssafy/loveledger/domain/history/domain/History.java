package com.ssafy.loveledger.domain.history.domain;

import com.ssafy.loveledger.domain.account.domain.Account;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table
public class History {

    @Id
    private Long transactionId;

    @ManyToOne
    private Account account;

    private LocalDateTime createdDate;
    private LocalTime createdTime;

    private int transactionType;
    private String transactionTypeName;

    private String transactionAccount;
    private Long transactionAmount;
    private Long AmountAfterTransaction;
    private String memo;
    private String transactionTarget;

    private String summary;
}
