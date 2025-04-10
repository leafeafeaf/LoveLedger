package com.ssafy.webfluxservice.domain.user.domain;

import java.time.LocalDate;
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
@Table("user")
public class User {

    @Id
    private Long id;

    private String email;

    private Boolean gender;

    @Column("birth_day")
    private LocalDate birthDay;

    private String provider;
    private String usercode;
    private String name;
    private String picture;

    @Column("is_married")
    private Boolean isMarried;

    @Column("user_key")
    private String userKey;

    @Column("couple_id")
    private Long coupleId;
}