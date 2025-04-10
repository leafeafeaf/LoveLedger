package com.ssafy.webfluxservice.domain.account.domain;


import java.time.LocalDateTime;
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
@Table("account")
public class Account {

    @Id
    @Column("account_id")
    private String accountId;

    @Column("user_id")
    private Long userId;

    @Column("bank_code")
    private String bankCode;

    @Column("certed_at")
    private LocalDateTime certedAt;

    private Long amount;

    @Column("last_updated")
    private LocalDateTime lastUpdated;

}
