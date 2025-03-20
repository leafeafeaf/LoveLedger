package com.ssafy.loveledger.domain.statistics.domain;

import com.ssafy.loveledger.domain.statistics.domain.key.DayId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DailyStatistics {

    @EmbeddedId
    private DayId dayId;

    private Long totalEarnSum;

    private Long totalConsumeSum;

}
