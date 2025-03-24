package com.ssafy.loveledger.domain.user.service;


import com.ssafy.loveledger.domain.couple.domain.Couple;
import com.ssafy.loveledger.domain.couple.domain.repository.CoupleRepository;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.domain.user.presentation.dto.request.UserInfoRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.request.UserUpdateRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.response.DetailUserResponse;
import com.ssafy.loveledger.domain.user.presentation.dto.response.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE; // yyyy-MM-dd 형식
    private final UserRepository userRepository;
    private final CoupleRepository coupleRepository;

    @Transactional(readOnly = true)
    public DetailUserResponse getDetailUserInfo(Long userId) {
        // 1. 사용자 정보 조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("해당 ID를 가진 사용자가 없습니다: " + userId));

        // 2. 부부 정보 조회
        Optional<Couple> coupleOpt = coupleRepository.findByUserId(userId);

        // 기본값 설정
        boolean isMarried = false;
        String marryDate = null;
        String darling = null;
        String darlingName = null;
        String darlingBirthDay = null;
        int marriageDuration = 0;

        // 3. 부부 정보가 있는 경우 처리
        if (coupleOpt.isPresent()) {
            Couple couple = coupleOpt.get();
            isMarried = couple.isMarried();

            // 결혼 날짜가 있으면 설정 및 기간 계산
            if (couple.getMarryDate() != null) {
                // 하이픈이 포함된 형식으로 결혼 날짜 변환 (yyyy-MM-dd)
                marryDate = couple.getMarryDate().format(DATE_FORMATTER);

                // ChronoUnit을 사용하여 전체 일수로 결혼 기간 계산
                marriageDuration = (int) ChronoUnit.DAYS.between(couple.getMarryDate(),
                    LocalDate.now());
            }

            // 4. 배우자 ID 확인
            Long partnerUserId = null;

            // 현재 사용자가 남편인 경우 -> 아내 정보 가져오기
            if (userId.equals(couple.getHusbandId())) {
                partnerUserId = couple.getWifeId();
            }
            // 현재 사용자가 아내인 경우 -> 남편 정보 가져오기
            else if (userId.equals(couple.getWifeId())) {
                partnerUserId = couple.getHusbandId();
            }

            // 5. 배우자 정보 조회 및 설정
            if (partnerUserId != null) {
                Optional<User> partnerOpt = userRepository.findById(partnerUserId);
                if (partnerOpt.isPresent()) {
                    User partner = partnerOpt.get();

                    // 배우자의 이메일, 이름 설정
                    darling = partner.getEmail();
                    darlingName = partner.getName();

                    // 배우자의 생일을 하이픈이 포함된 형식(yyyy-MM-dd)으로 변환
                    if (partner.getBirthDay() != null) {
                        darlingBirthDay = partner.getBirthDay().format(DATE_FORMATTER);
                    }
                }
            }
        }

        // 6. 현재 사용자의 생일 형식 변환 (yyyy-MM-dd 형식으로)
        String formattedBirthday = null;
        if (user.getBirthDay() != null) {
            formattedBirthday = user.getBirthDay().format(DATE_FORMATTER);
        }

        // 7. DTO 생성 및 반환
        return DetailUserResponse.builder()
            .email(user.getEmail())
            .name(user.getName())
            .birthDay(formattedBirthday)
            .gender(user.getGender())
            .isMarried(isMarried)
            .marryDate(marryDate)
            .darling(darling)
            .darlingName(darlingName)
            .darlingBirthDay(darlingBirthDay)
            .marriageDuration(marriageDuration)
            .build();
    }

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
            userBuilder.birthDay(request.getBirthday());  // 일관된 필드명 사용
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
            .birthDay(savedUser.getBirthDay().format(DATE_FORMATTER))  // LocalDate를 문자열로 변환
            .isMarried(savedUser.getIsMarried())
            .build();
    }
}


