package com.ssafy.loveledger.domain.couple.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "couple")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Couple {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "couple_id")
    private Long id;

    @Column(name = "husband_id")
    private Long husbandId;

    @Column(name = "wife_id")
    private Long wifeId;

    @Column(name = "is_married")
    private boolean isMarried;

    @Column(name = "marry_date")
    private LocalDate marryDate;
}