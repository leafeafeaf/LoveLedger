package com.ssafy.gatewayservice.domain.user.domain;


import com.ssafy.gatewayservice.domain.library.domain.Library;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;

    private Boolean gender;
    private LocalDate birthDay;
    private String provider;
    private String usercode;
    private String name;
    private String picture;

    private Boolean isMarried;

    @Column(unique = true)
    private String userKey;

    @OneToOne(mappedBy = "user")
    private Library library;
}