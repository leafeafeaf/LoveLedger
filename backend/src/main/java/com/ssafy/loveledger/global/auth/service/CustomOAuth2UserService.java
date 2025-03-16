package com.ssafy.loveledger.global.auth.service;

import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.auth.dto.request.UserDto;
import com.ssafy.loveledger.global.auth.dto.response.GoogleResponse;
import com.ssafy.loveledger.global.auth.dto.response.OAuth2Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oauth2User = super.loadUser(userRequest);
//        System.out.println(oauth2User);
        log.info("oauth2 유저 정보 : {}", oauth2User);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        OAuth2Response oauth2Response = null;

        if (registrationId.equals("google")) {
            oauth2Response = new GoogleResponse(oauth2User.getAttributes());
        } else {
            return null;
        }

        String username = oauth2Response.getProvider() + " " + oauth2Response.getProviderId();
        User existData = userRepository.findByUsername(username);

        if (existData == null) {
            User user = User.builder().username(username).email(oauth2Response.getEmail())
                .name(oauth2Response.getName()).role("ROLE_USER").build();

            userRepository.save(user);

            UserDto userDto = UserDto.builder().username(username).name(oauth2Response.getName())
                .role("ROLE_USER").build();

            return new CustomOAuth2User(userDto);

        } else {
            existData.setEmail(oauth2Response.getEmail());
            existData.setName(oauth2Response.getName());
            userRepository.save(existData);

            UserDto userDto = UserDto.builder().name(existData.getName())
                .username(existData.getUsername()).role(existData.getRole()).build();
            return new CustomOAuth2User(userDto);
        }
    }
}
