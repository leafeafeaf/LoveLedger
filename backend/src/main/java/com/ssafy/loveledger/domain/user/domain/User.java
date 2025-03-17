package com.ssafy.loveledger.domain.user.domain;

import com.ssafy.loveledger.domain.account.domain.Account;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter @Setter @Builder
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private Boolean gender;
    private LocalDateTime birthDate;

    private String provider;
    private String userCode;

    private String name;

//    @Column(name = "couple_id", nullable = false)
//    private Integer coupleId;

//    @OneToOne(mappedBy = "owner", fetch = FetchType.LAZY)
//    private Library library;
//
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Account> account;

//    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
//    @BatchSize(size = 10)
//    private List<DailyStatistics> dailyStatistics;
//
//    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
//    @BatchSize(size = 10)
//    private List<MonthlyStatisticsByCategory> monthlyStatisticsByCategories;
//
//    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
//    @BatchSize(size = 10)
//    private List<WeeklyStatisticsByCategory> weeklyStatisticsByCategories;
//
//    @OneToOne(mappedBy = "owner", fetch = FetchType.LAZY)
//    private Goal goals;
}