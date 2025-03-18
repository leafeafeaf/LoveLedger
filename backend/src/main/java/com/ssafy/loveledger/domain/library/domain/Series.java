package com.ssafy.loveledger.domain.library.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@Getter
@Setter
@Table
@Entity
public class Series {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String SeriesTitle;

    @ManyToOne
    @JoinColumn(name = "collection_id")
    private Library library;

    @OneToMany(mappedBy = "series")
    private List<Fiction> fiction;


}
