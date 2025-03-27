package com.ssafy.loveledger.domain.user.service;


import com.ssafy.loveledger.domain.couple.domain.Couple;
import com.ssafy.loveledger.domain.couple.domain.repository.CoupleRepository;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.domain.user.presentation.dto.request.UserInfoRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.request.UserUpdateRequest;
import com.ssafy.loveledger.domain.user.presentation.dto.response.DetailUserResponse;
import com.ssafy.loveledger.domain.user.presentation.dto.response.UserResponse;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

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
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, String.valueOf(userId)));

        DetailUserResponse.CoupleInfo coupleInfo = getCoupleInfo(userId);

        String formattedBirthday = Optional.ofNullable(user.getBirthDay())
            .map(birthday -> birthday.format(DATE_FORMATTER))
            .orElse(null);

        // 7. DTO 생성 및 반환
        return DetailUserResponse.builder()
            .email(user.getEmail())
            .name(user.getName())
            .birthDay(formattedBirthday)
            .gender(user.getGender())
            .isMarried(coupleInfo.isMarried())
            .marryDate(coupleInfo.getMarryDate())
            .darling(coupleInfo.getDarling())
            .darlingName(coupleInfo.getDarlingName())
            .darlingBirthDay(coupleInfo.getDarlingBirthDay())
            .marriageDuration(coupleInfo.getMarriageDuration())
            .picture(user.getPicture())
            .build();
    }

    public void saveUserInfo(Long userId, UserInfoRequest request) {
        LocalDate birthDay = request.getBirthDay();

        // 추가 논리 검사 (미래 날짜 방지)
        if (birthDay.isAfter(LocalDate.now())) {
            throw new LoveLedgerException(ErrorCode.INVALID_INPUT_VALUE, "생일은 미래 날짜일 수 없습니다.");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, String.valueOf(userId)));

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
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, String.valueOf(userId)));

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
            .picture(user.getPicture())
            .account(user.getAccount());

        // 요청에 포함된 필드만 업데이트
        if (request.getName() != null) {
            userBuilder.name(request.getName());
        }

        if (request.getGender() != null) {
            userBuilder.gender(request.getGender());
        }
        if (request.getBirthDay() != null) {
            userBuilder.birthDay(request.getBirthDay());  // 일관된 필드명 사용
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

    private DetailUserResponse.CoupleInfo getCoupleInfo(Long userId) {
        Optional<Couple> coupleOpt = coupleRepository.findByUserId(userId);

        if (coupleOpt.isEmpty()) {
            return DetailUserResponse.CoupleInfo.empty();
        }

        Couple couple = coupleOpt.get();
        String marryDate = null;
        int marriageDuration = 0;

        if (couple.getMarryDate() != null) {
            marryDate = couple.getMarryDate().format(DATE_FORMATTER);
            marriageDuration = (int) ChronoUnit.DAYS.between(couple.getMarryDate(), LocalDate.now());
        }

        Long partnerId = userId.equals(couple.getHusbandId()) ? couple.getWifeId() : couple.getHusbandId();

        User partner = userRepository.findById(partnerId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, String.valueOf(partnerId)));

        return DetailUserResponse.CoupleInfo.builder()
            .isMarried(couple.isMarried())
            .marryDate(marryDate)
            .darling(partner.getEmail())
            .darlingName(partner.getName())
            .darlingBirthDay(partner.getBirthDay() != null ? partner.getBirthDay().format(DATE_FORMATTER) : null)
            .marriageDuration(marriageDuration)
            .build();
    }
}


