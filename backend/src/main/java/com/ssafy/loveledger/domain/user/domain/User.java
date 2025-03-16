package com.ssafy.loveledger.domain.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Setter
@Table(name = "User")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;
    private String username;
    private String role;
    private Boolean gender;
    private Date birthDate;
    private String name;

//    @Column(name = "couple_id", nullable = false)
//    private Integer coupleId;

//    @OneToOne(mappedBy = "owner", fetch = FetchType.LAZY)
//    private Library library;
//
//    @OneToOne(mappedBy = "owner", fetch = FetchType.LAZY)
//    private Account account;

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