package com.ssafy.loveledger.domain.library.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@Table
@Entity
public class Fiction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;

    private String artURL;

    @Lob
    private String content;

    private String theme;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String Title;

    @ManyToOne
    @JoinColumn(name = "series_id")
    private Series series;

}
