package com.ssafy.loveledger.domain.library.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@NoArgsConstructor
@Getter
@Setter
@Builder
@AllArgsConstructor
@Table
@Entity
public class Series {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne
    @JoinColumn(name = "collection_id")
    private Library library;

    @OneToMany(mappedBy = "series", fetch = FetchType.LAZY)
    private List<Fiction> fiction;


}
