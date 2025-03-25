package com.ssafy.loveledger.domain.user.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
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
    private String birthDay;
    private boolean gender;
    @JsonProperty("isMarried")
    @Getter(value = AccessLevel.NONE)
    private boolean isMarried;
    private String marryDate;
    private String darling;
    private String darlingName;
    private String darlingBirthDay;
    private int marriageDuration;
}
