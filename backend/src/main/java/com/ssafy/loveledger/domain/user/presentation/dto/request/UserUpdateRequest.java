package com.ssafy.loveledger.domain.user.presentation.dto.request;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    private String name;
    private Boolean gender;
    private LocalDate birthDay; // YYYYMMDD 형식 문자열
    private Boolean isMarried;

}
