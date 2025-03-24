package com.ssafy.loveledger.domain.goal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@Table
@NoArgsConstructor
public class Goal {

    @Id
    private Long id;

    @Column(nullable = false)
    private Long goalAmount;

    @Column(nullable = false)
    private Long currentAmount;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate goalDate;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String contentURL;
}
