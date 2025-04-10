package com.ssafy.webfluxservice.domain.library.domain;

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
@Table("series")
public class Series {

    @Id
    private Long id;

    private String title;

    @Column("collection_id") // Library의 ID (외래키)
    private Long libraryId;

}