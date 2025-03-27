package com.ssafy.loveledger.global.auth.service;

import com.ssafy.loveledger.domain.library.domain.Library;
import com.ssafy.loveledger.domain.library.domain.repository.LibraryRepository;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.auth.dto.request.UserDto;
import com.ssafy.loveledger.global.auth.dto.response.GoogleResponse;
import com.ssafy.loveledger.global.auth.dto.response.OAuth2Response;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
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
    @Lazy
    private final LibraryRepository libraryRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oauth2User = super.loadUser(userRequest);
        log.info("oauth2 유저 정보 : {}", oauth2User);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        OAuth2Response oauth2Response = null;

        if (registrationId.equals("google")) {
            oauth2Response = new GoogleResponse(oauth2User.getAttributes());
        } else {
            return null;
        }

        String provider = oauth2Response.getProvider();
        String code = oauth2Response.getProviderId();
        String username = provider + " " + code;
        String picture = oauth2Response.getPicture();

        Optional<User> existData = userRepository.findByProviderAndUsercode(provider, code);

        if (existData.isEmpty()) {
            User user = User.builder().provider(provider).email(oauth2Response.getEmail())
                .name(oauth2Response.getName()).usercode(code).picture(picture).build();

            //TODO 금융 API user key

            User savedUser = userRepository.save(user);
            log.info("############  user = {}", savedUser);


            // 해당 사용자의 라이브러리 생성
            Library library = Library.builder()
                .user(savedUser) // 사용자 ID 설정
                .build();

            Library savedLibary = libraryRepository.save(library);
            // 회원가입이 완료되지 않은 상태 (추가 정보 입력 필요)
            boolean isRegistered = isUserRegistrationComplete(savedUser);

            UserDto userDto = UserDto.builder().username(username)
                .username(username)
                .picture(picture)
                .name(oauth2Response.getName())
                .userId(savedUser.getId())
                .isRegistered(isRegistered)
                .libraryId(savedLibary.getId())
                .build();

            return new CustomOAuth2User(userDto);

        } else {
            User existingUser = existData.get();

            existingUser.setEmail(oauth2Response.getEmail());
            existingUser.setName(oauth2Response.getName());
            existingUser.setPicture(oauth2Response.getPicture());
            userRepository.save(existingUser);

            // 기존 사용자의 라이브러리 조회
            Library userLibrary = libraryRepository.findByUser(existingUser)
                .orElseThrow(
                    () -> new RuntimeException("사용자에 연결된 라이브러리가 없습니다: " + existingUser.getId()));

            // 여기서 회원가입 완료 여부 확인 추가
            boolean isRegistered = isUserRegistrationComplete(existingUser);
            log.info("기존 사용자 회원가입 상태: {}, userId: {}", isRegistered, existingUser.getId());


            UserDto userDto = UserDto.builder().name(existingUser.getName())
                .userId(existingUser.getId())
                .username(username)
                .picture(picture)
                .libraryId(userLibrary.getId())
                .isRegistered(isRegistered)
                .build();

            return new CustomOAuth2User(userDto);
        }
    }

    /**
     * 사용자의 회원가입 완료 여부를 확인하는 메서드
     * 필수 정보가 모두 입력되었는지 확인합니다.
     *
     * @param user 확인할 사용자 객체
     * @return 회원가입 완료 여부
     */
    private boolean isUserRegistrationComplete(User user) {
        // 필수 정보가 모두 입력되었는지 확인
        return user.getName() != null
            && user.getBirthDay() != null
            && user.getGender() != null
            && user.getIsMarried() != null;
    }
}
