package com.ssafy.loveledger.domain.user.domain;

import com.ssafy.loveledger.domain.account.domain.Account;
import com.ssafy.loveledger.domain.couple.domain.Couple;
import com.ssafy.loveledger.domain.library.domain.Library;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //    @Column(unique = true, nullable = false)
    private String email;

    private Boolean gender;
    private LocalDate birthDay;
    private String provider;
    private String usercode;
    private String name;
    private String picture;

    private Boolean isMarried;

    @Column(unique = true)
    private String userKey;

    @OneToOne(mappedBy = "user")
    private Library library;

    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    private List<Account> account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "couple_id")
    private Couple couple;

//    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
//    private List<DailyStatistics> dailyStatistics;
//
//    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
//    private List<MonthlyStatisticsByCategory> monthlyStatisticsByCategories;
//
//    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
//    private List<WeeklyStatisticsByCategory> weeklyStatisticsByCategories;
//
//    @OneToOne(mappedBy = "owner", fetch = FetchType.LAZY)
//    private Goal goals;
}