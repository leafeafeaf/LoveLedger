package com.ssafy.gatewayservice.global.security.service;

import com.ssafy.gatewayservice.domain.library.domain.Library;
import com.ssafy.gatewayservice.domain.library.domain.repository.LibraryRepository;
import com.ssafy.gatewayservice.domain.user.domain.User;
import com.ssafy.gatewayservice.domain.user.domain.repository.UserRepository;
import com.ssafy.gatewayservice.global.security.dto.request.CustomOAuth2User;
import com.ssafy.gatewayservice.global.security.dto.request.UserDto;
import com.ssafy.gatewayservice.global.security.dto.response.GoogleResponse;
import com.ssafy.gatewayservice.global.security.dto.response.OAuth2Response;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.oauth2.client.userinfo.DefaultReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService implements
    ReactiveOAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    @Lazy
    private final LibraryRepository libraryRepository;
    private final DefaultReactiveOAuth2UserService delegate = new DefaultReactiveOAuth2UserService();

    @Override
    public Mono<OAuth2User> loadUser(OAuth2UserRequest userRequest)
        throws OAuth2AuthenticationException {
        return delegate.loadUser(userRequest)
            .flatMap(oauth2User -> Mono.fromCallable(() -> {

                log.info("oauth2 유저 정보 : {}", oauth2User);
                String registrationId = userRequest.getClientRegistration().getRegistrationId();

                OAuth2Response oauth2Response;
                if (registrationId.equals("google")) {
                    oauth2Response = new GoogleResponse(oauth2User.getAttributes());
                } else {
                    throw new IllegalArgumentException("지원하지 않는 OAuth Provider: " + registrationId);
                }

                String provider = oauth2Response.getProvider();
                String code = oauth2Response.getProviderId();
                String username = provider + " " + code;
                String picture = oauth2Response.getPicture();

                Optional<User> existData = userRepository.findByProviderAndUsercode(provider, code);

                if (existData.isEmpty()) {
                    // 신규 사용자 등록
                    User user = User.builder()
                        .provider(provider)
                        .email(oauth2Response.getEmail())
                        .name(oauth2Response.getName())
                        .usercode(code)
                        .picture(picture)
                        .build();

                    User savedUser = userRepository.save(user);

                    Library library = Library.builder()
                        .user(savedUser)
                        .build();

                    Library savedLibrary = libraryRepository.save(library);

                    boolean isRegistered = isUserRegistrationComplete(savedUser);

                    UserDto userDto = UserDto.builder()
                        .username(username)
                        .picture(picture)
                        .name(oauth2Response.getName())
                        .userId(savedUser.getId())
                        .isRegistered(isRegistered)
                        .libraryId(savedLibrary.getId())
                        .email(savedUser.getEmail())
                        .build();

                    return new CustomOAuth2User(userDto);

                } else {
                    // 기존 사용자 업데이트
                    User existingUser = existData.get();
                    existingUser.setEmail(oauth2Response.getEmail());
                    existingUser.setName(oauth2Response.getName());
                    existingUser.setPicture(oauth2Response.getPicture());
                    userRepository.save(existingUser);

                    Library userLibrary = libraryRepository.findByUser(existingUser)
                        .orElseThrow(() -> new RuntimeException(
                            "사용자에 연결된 라이브러리가 없습니다: " + existingUser.getId()));

                    boolean isRegistered = isUserRegistrationComplete(existingUser);

                    UserDto userDto = UserDto.builder()
                        .name(existingUser.getName())
                        .userId(existingUser.getId())
                        .username(username)
                        .picture(picture)
                        .libraryId(userLibrary.getId())
                        .isRegistered(isRegistered)
                        .email(existingUser.getEmail())
                        .build();

                    return new CustomOAuth2User(userDto);
                }

            }).subscribeOn(Schedulers.boundedElastic())); // blocking DB 작업을 비동기 스레드로 분리

    }

    private boolean isUserRegistrationComplete(User user) {
        // 필수 정보가 모두 입력되었는지 확인
        return user.getName() != null
            && user.getBirthDay() != null
            && user.getGender() != null
            && user.getIsMarried() != null;
    }
}
