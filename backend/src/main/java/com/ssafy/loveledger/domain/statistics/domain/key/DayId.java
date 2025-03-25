package com.ssafy.loveledger.domain.statistics.domain.key;

import com.ssafy.loveledger.domain.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Data
public class DayId implements Serializable {

    @Column(name = "target_day")
    private LocalDate targetDay;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
