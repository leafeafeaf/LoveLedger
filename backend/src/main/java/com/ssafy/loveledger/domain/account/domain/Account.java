package com.ssafy.loveledger.domain.account.domain;

import com.ssafy.loveledger.domain.history.domain.History;
import com.ssafy.loveledger.domain.user.domain.User;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "account")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Account {
    @Id
    private String accountId;

    @JoinColumn(name = "user_id")
    @ManyToOne
    private User user;
    private String bankCode;
    private LocalDateTime certedAt;
    private Long amount;

    @OneToMany(fetch = FetchType.LAZY)
    private List<History> historyList;


}
