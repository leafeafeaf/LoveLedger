package com.ssafy.loveledger.global.auth.dto.request;

import java.util.Collection;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

@RequiredArgsConstructor
public class CustomOAuth2User implements OAuth2User {

    private final UserDto userDto;


    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }

    @Override
    public String getName() {
        return userDto.getName();
    }

    public Long getUserId() {
        return userDto.getUserId();
    }

    public String getUsername() {
        return userDto.getUsername();
    }

    public Long getLibraryId() {
        return userDto.getLibraryId();
    }

    public String getPicture() {
        return userDto.getPicture();
    }

    public Boolean getIsRegistered() {
        return userDto.isRegistered();
    }
}
