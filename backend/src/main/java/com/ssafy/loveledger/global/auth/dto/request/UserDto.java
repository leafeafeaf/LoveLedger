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

}
