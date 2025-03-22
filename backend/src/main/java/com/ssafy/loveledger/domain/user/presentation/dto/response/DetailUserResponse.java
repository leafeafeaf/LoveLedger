package com.ssafy.loveledger.domain.user.presentation.dto.response;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailUserResponse {
    private String email;
    private String name;
    private LocalDate birthDay;
    private boolean gender;
    private boolean isMarried;
    private String marryDate;
    private String darling;
    private String darlingName;
    private LocalDate darlingBirthDay;
    private int marriageDuration;
}
