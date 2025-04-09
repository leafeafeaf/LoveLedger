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
    private int marriageDuration;
    private String picture;
    private CoupleInfo coupleInfo;
    private String marryDate;

    @Getter
    @Builder
    public static class CoupleInfo {
        private Long coupleId;
        private String darlingEmail;
        private String darlingName;
        private String darlingBirthDay;
        private String darlingPicture;
        public static CoupleInfo empty() {
            return CoupleInfo.builder().build();
        }
    }
}
