package com.ssafy.loveledger.global.auth.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserDto {

    private Long userId;
    private String name;
    private String username;
    private Long libraryId;
    private String picture;
    private boolean isRegistered; // 회원가입 완료 여부를 나타내는 필드 추가
}
