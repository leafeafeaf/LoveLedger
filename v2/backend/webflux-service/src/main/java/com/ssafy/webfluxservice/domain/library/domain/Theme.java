package com.ssafy.webfluxservice.domain.library.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("theme")
public class Theme {

    @Id
    private Long id;

    private String name;

    private String description;

    @Column("example_url")
    private String exampleURL;
}