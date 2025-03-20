package com.ssafy.loveledger.domain.user.service;

import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.domain.user.presentation.dto.request.UserInfoRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.request.UserUpdateRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.response.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
//    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyyMMdd");

    public void saveUserInfo(Long userId, UserInfoRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        User updatedUser = User.builder()
            .id(user.getId())
            .email(user.getEmail())
            .provider(user.getProvider())
            .usercode(user.getUsercode())
            .name(request.getName())
            .gender(request.getGender())
            .birthDay(request.getBirthDay())
            .isMarried(request.getIsMarried())
            .build();

        userRepository.save(updatedUser);
    }

    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        // 기존 정보를 유지하면서 빌더 패턴으로 업데이트
        User.UserBuilder userBuilder = User.builder()
            .id(user.getId())
            .email(user.getEmail())
            .provider(user.getProvider())
            .usercode(user.getUsercode())
            .name(user.getName())
            .gender(user.getGender())
            .birthDay(user.getBirthDay())
            .isMarried(user.getIsMarried())
            .library(user.getLibrary())
            .account(user.getAccount());

        // 요청에 포함된 필드만 업데이트
        if (request.getName() != null) {
            userBuilder.name(request.getName());
        }

        if (request.getGender() != null) {
            userBuilder.gender(request.getGender());
        }
        if (request.getBirthday() != null) {
            LocalDate birthDay = request.getBirthday();
            userBuilder.birthDay(birthDay);
        }
        if (request.getIsMarried() != null) {
            userBuilder.isMarried(request.getIsMarried());
        }
        // 업데이트된 사용자 저장
        User savedUser = userRepository.save(userBuilder.build());

        // 응답 DTO 변환
        return UserResponse.builder()
            .name(savedUser.getName())
            .gender(savedUser.getGender())
            .birthday(savedUser.getBirthDay())
            .isMarried(savedUser.getIsMarried())
            .build();
    }
}


