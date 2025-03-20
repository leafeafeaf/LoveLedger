package com.ssafy.loveledger.domain.history.domain;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.statistics.CategoryUtil;
import com.ssafy.loveledger.domain.statistics.domain.Category;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class History {

    @Id
    private String transactionId;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    private LocalDate createdDate;
    private LocalTime createdTime;

    private int transactionType;
    private String transactionTypeName;

    private String transactionAccount;
    private Long transactionAmount;
    private Long AmountAfterTransaction;
    private String memo;
    private String transactionTarget;
    private String summary;

    @Convert(converter = CategoryUtil.class) // 변환기 적용
    private Category category;

    private boolean isDeleted = false;

    public void delete() {
        this.isDeleted = true;
    }

    public void updateTargetName(String targetName) {
        this.transactionTarget = targetName;
    }
}
