package com.ssafy.loveledger.domain.library.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@Builder
@AllArgsConstructor
@Table
@Entity
public class Fiction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;

    private String artURL;

    @ManyToOne
    @JoinColumn(name = "series_id")
    private Series series;
    
    @Lob
    private String content;

    private LocalDate startDate;

    private LocalDate endDate;

    private String Title;

    @PrePersist
    protected void OnCreate() {
        this.createdAt = LocalDateTime.now();
    }


}
