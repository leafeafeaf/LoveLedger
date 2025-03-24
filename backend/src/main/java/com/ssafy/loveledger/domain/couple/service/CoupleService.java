package com.ssafy.loveledger.domain.couple.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.loveledger.domain.couple.domain.Couple;
import com.ssafy.loveledger.domain.couple.domain.repository.CoupleRepository;
import com.ssafy.loveledger.domain.invite.service.InviteService;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CoupleService {

    private final UserRepository userRepository;
    private final CoupleRepository coupleRepository;
    private final InviteService inviteService;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 사용자가 이미 커플 관계에 있는지 확인합니다.
     *
     * @param userId 사용자 ID
     * @return 커플 관계 여부
     */
    public boolean isUserAlreadyCoupled(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        return user.getCouple() != null;
    }

    /**
     * 사용자의 커플 등록 시간을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 커플 등록 시간
     */
    public LocalDateTime getCoupleRegisteredTime(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        if (user.getCouple() == null) {
            throw new IllegalStateException("커플 관계가 존재하지 않습니다");
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
            throw new IllegalArgumentException("유효하지 않은 초대 코드입니다");
        }

        try {
            // JSON 파싱
            JsonNode inviteData = objectMapper.readTree(inviteDataJson);

            // 만료 시간 확인
            LocalDateTime expiresAt = LocalDateTime.parse(
                inviteData.get("expiresAt").asText(),
                DateTimeFormatter.ISO_DATE_TIME
            );

            if (LocalDateTime.now().isAfter(expiresAt)) {
                throw new IllegalStateException("초대 링크가 만료되었습니다");
            }

            // 초대자 ID 가져오기
            Long inviterId = inviteData.get("inviterId").asLong();

            // 초대자 정보 조회
            User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new IllegalArgumentException("초대자를 찾을 수 없습니다"));

            // 초대받은 사용자 정보 조회
            User invitee = userRepository.findById(inviteeId)
                .orElseThrow(() -> new IllegalArgumentException("초대받은 사용자를 찾을 수 없습니다"));

            // 초대자가 이미 커플 관계인지 확인
            if (inviter.getCouple() != null) {
                throw new IllegalStateException("초대자가 이미 다른 사용자와 연동되어 있습니다");
            }

            // 초대받은 사용자가 이미 커플 관계인지 확인 (이중 확인)
            if (invitee.getCouple() != null) {
                throw new IllegalStateException("이미 연동되어 있는 계정입니다");
            }

            // 성별에 따라 남편/아내 구분 (선택적)
            Long husbandId, wifeId;
            if (inviter.getGender() && !invitee.getGender()) {
                // 초대자가 남성, 초대받은 사용자가 여성
                husbandId = inviterId;
                wifeId = inviteeId;
            } else if (!inviter.getGender() && invitee.getGender()) {
                // 초대자가 여성, 초대받은 사용자가 남성
                husbandId = inviteeId;
                wifeId = inviterId;
            } else {
                // 같은 성별이거나 성별 구분이 중요하지 않은 경우
                // 초대자를 남편으로, 초대받은 사용자를 아내로 설정 (또는 다른 규칙 적용)
                // TODO 또다른 규칙 적용
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

            userRepository.save(inviter);
            userRepository.save(invitee);

            // 초대 코드 사용 처리
            inviteService.useInviteCode(inviteCode, inviteeId);

        } catch (JsonProcessingException e) {
            throw new IllegalStateException("초대 정보 처리 중 오류가 발생했습니다", e);
        }
    }
}
