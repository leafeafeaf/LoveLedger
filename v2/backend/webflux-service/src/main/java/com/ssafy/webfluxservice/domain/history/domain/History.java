package com.ssafy.webfluxservice.domain.history.domain;

import com.ssafy.webfluxservice.domain.category.Category;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("history")
public class History {

    @Id
    @Column("transaction_id")
    private String transactionId;

    @Column("account_id")
    private String accountId;

    @Column("created_date")
    private LocalDate createdDate;

    @Column("created_time")
    private LocalTime createdTime;

    @Column("transaction_type")
    private int transactionType;

    @Column("transaction_type_name")
    private String transactionTypeName;

    @Column("transaction_account")
    private String transactionAccount;

    @Column("transaction_amount")
    private Long transactionAmount;

    @Column("amount_after_transaction")
    private Long amountAfterTransaction;

    private String memo;

    @Column("transaction_target")
    private String transactionTarget;

    private String summary;

    // Enum Category는 String 타입 컬럼으로 저장된다고 가정
    private Category category;

    @Column("is_deleted")
    private boolean isDeleted;

}