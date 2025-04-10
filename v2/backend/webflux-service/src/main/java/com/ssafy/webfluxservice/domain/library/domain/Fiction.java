package com.ssafy.webfluxservice.domain.library.domain;

import java.time.LocalDate;
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
@Table("fiction")
public class Fiction {

    @Id
    private Long id;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("art_url")
    private String artURL;

    @Column("series_id")
    private Long seriesId;

    private String content;

    @Column("start_date")
    private LocalDate startDate;

    @Column("end_date")
    private LocalDate endDate;

    @Column("title")
    private String title;
}