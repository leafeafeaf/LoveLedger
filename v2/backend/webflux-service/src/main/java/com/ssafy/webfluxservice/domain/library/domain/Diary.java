package com.ssafy.webfluxservice.domain.library.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Table("diary")
public class Diary {

    @Id
    private Long id;

    @Column("collection_id") // 외래키 ID로 직접 관리
    private Long libraryId;

    @Column("target_date")
    private LocalDate targetDate;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;

    private String title;

    private Integer mood;

    @Column("content")
    private String content;
}