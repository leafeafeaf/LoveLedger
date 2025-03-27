package com.ssafy.loveledger.domain.couple.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.loveledger.domain.couple.domain.Couple;
import com.ssafy.loveledger.domain.couple.domain.repository.CoupleRepository;
import com.ssafy.loveledger.domain.invite.service.InviteService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoupleService {

    private final UserRepository userRepository;
    private final CoupleRepository coupleRepository;
    private final InviteService inviteService;
    private final ObjectMapper objectMapper;

    /**
     * 사용자의 커플 등록 시간을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 커플 등록 시간
     */
    public LocalDateTime getCoupleRegisteredTime(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, userId.toString()));

        if (user.getCouple() == null) {
            throw new LoveLedgerException(ErrorCode.COUPLE_NOT_FOUND, userId.toString());
        }

        return user.getCouple().getCreatedAt(); // Couple 엔티티에 createdAt 필드가 있다고 가정
    }

    /**
     * 초대 코드를 사용하여 커플 관계를 생성합니다.
     *
     * @param inviteCode 초대 코드
     * @param inviteeId  초대받은 사용자 ID
     */
    @Transactional
    public void createCouple(String inviteCode, Long inviteeId) {
        // 초대 코드 유효성 검증
        String inviteDataJson = inviteService.validateInviteCode(inviteCode);
        if (inviteDataJson == null) {
            throw new LoveLedgerException(ErrorCode.INVALID_INVITE_CODE, inviteCode);
        }


        try {
            // JSON 파싱
            JsonNode inviteData = objectMapper.readTree(inviteDataJson);

            // 초대 코드 만료 시간 확인
            LocalDateTime expiresAt = LocalDateTime.parse(
                inviteData.get("expiresAt").asText(), DateTimeFormatter.ISO_DATE_TIME);
            if (LocalDateTime.now().isAfter(expiresAt)) {
                throw new LoveLedgerException(ErrorCode.INVITE_EXPIRED, expiresAt.toString());
            }

            // 초대자 ID 가져오기
            Long inviterId = inviteData.get("inviterId").asLong();
            log.info("###########{}", inviterId);


            // 자기 자신과의 연동 방지 체크
            if (inviterId.equals(inviteeId)) {
                throw new LoveLedgerException(ErrorCode.INVALID_REQUEST, "자기 자신과 연동할 수 없습니다.");
            }


            // 초대자, 초대받은 사용자 조회
            User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, inviterId.toString()));

            User invitee = userRepository.findById(inviteeId)
                .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, inviteeId.toString()));

            // 이미 커플인지 체크
            if (inviter.getCouple() != null) {
                throw new LoveLedgerException(ErrorCode.ALREADY_COUPLED, inviterId.toString());
            }

            if (invitee.getCouple() != null) {
                throw new LoveLedgerException(ErrorCode.ALREADY_COUPLED, inviteeId.toString());
            }

            // 성별 체크 후 husband/wife 설정
            Long husbandId, wifeId;
            if (inviter.getGender() && !invitee.getGender()) {
                husbandId = inviterId;
                wifeId = inviteeId;
            } else if (!inviter.getGender() && invitee.getGender()) {
                husbandId = inviteeId;
                wifeId = inviterId;
            } else {
                husbandId = inviterId;
                wifeId = inviteeId;
            }

            // Couple 엔티티 생성 및 저장
            Couple couple = Couple.builder()
                .husbandId(husbandId)
                .wifeId(wifeId)
                .isMarried(true) // 또는 적절한 기본값
                .createdAt(LocalDateTime.now())
                .build();

            Couple savedCouple = coupleRepository.save(couple);

            // User 엔티티 업데이트
            inviter.setCouple(savedCouple);
            invitee.setCouple(savedCouple);

            // 초대 코드 사용 처리
            inviteService.useInviteCode(inviteCode, inviteeId);

        } catch (JsonProcessingException e) {
            throw new LoveLedgerException(ErrorCode.INTERNAL_SERVER_ERROR, "초대 정보 파싱 중 오류가 발생했습니다.");
        }
    }

    @Transactional
    public void deleteCouple(Long coupleId, Long userId) {

        Couple couple = coupleRepository.findById(coupleId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.COUPLE_NOT_FOUND,
                String.valueOf(coupleId)));

        if (!userId.equals(couple.getHusbandId()) && !userId.equals(couple.getWifeId())) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS, "연동 해제 권한이 없습니다.");
        }

        // 명시적으로 User 조회 후 isMarried 변경
        User husband = userRepository.findById(couple.getHusbandId())
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND,
                String.valueOf(couple.getHusbandId())));

        User wife = userRepository.findById(couple.getWifeId())
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND,
                String.valueOf(couple.getWifeId())));

        // Couple과 User 사이의 관계를 먼저 끊기
        husband.setCouple(null);
        husband.setIsMarried(false);

        wife.setCouple(null);
        wife.setIsMarried(false);

        // 관계를 끊은 후 저장 (명시적 호출)
        userRepository.save(husband);
        userRepository.save(wife);

        coupleRepository.delete(couple);
    }

    // 사용자가 이미 커플 관계인지 체크 후 예외 처리
    @Transactional(readOnly = true)
    public void validateUserNotAlreadyCoupled(Long userId) {
        if (isUserAlreadyCoupled(userId)) {
            LocalDateTime registeredAt = getCoupleRegisteredTime(userId);
            throw new LoveLedgerException(ErrorCode.ALREADY_COUPLED,
                registeredAt.format(DateTimeFormatter.ISO_DATE_TIME));
        }
    }

    /**
     * 사용자가 이미 커플 관계에 있는지 확인합니다.
     *
     * @param userId 사용자 ID
     * @return 커플 관계 여부
     */
    public boolean isUserAlreadyCoupled(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, userId.toString()));

        return user.getCouple() != null;
    }

}
