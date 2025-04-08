package com.ssafy.loveledger.domain.invite.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.deep-link-uri-scheme:loveledger}")
    private String uriScheme;

    @Value("${app.invite-expiry-hours:24}")
    private int inviteExpiryHours;

    // Redis에 저장될 키의 접두사
    private static final String INVITE_KEY_PREFIX = "invite:";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * 사용자 ID를 기반으로 고유한 초대 링크를 생성합니다. 안드로이드 앱용 딥링크를 생성합니다.
     *
     * @param userId 초대를 생성하는 사용자의 ID
     * @return 생성된 초대 링크 (딥링크 형식)
     */
    public String generateInviteLink(Long userId) {
        // 사용자 정보 조회
        User user = userRepository.findById(userId)
            .orElseThrow(
                () -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, String.valueOf(userId)));

        // 사용자가 이미 커플 관계가 있는지 확인
        if (user.getCouple() != null) {
            throw new LoveLedgerException(ErrorCode.ALREADY_COUPLED, String.valueOf(userId));
        }

        // 기존에 발급된 초대장이 있다면 삭제
        String userInviteKey = INVITE_KEY_PREFIX + "user:" + userId;
        String existingInviteCode = redisTemplate.opsForValue().get(userInviteKey);

        if (existingInviteCode != null) {
            // 기존 초대 정보 가져오기
            String existingInviteData = redisTemplate.opsForValue()
                .get(INVITE_KEY_PREFIX + "code:" + existingInviteCode);
            if (existingInviteData != null) {
                throw new LoveLedgerException(ErrorCode.ACTIVE_INVITE_EXISTS);
            } else {
                // 초대 코드는 있지만 데이터가 없는 경우, 정리
                redisTemplate.delete(userInviteKey);
            }
        }

        // 고유한 초대 코드 생성 (사용자 ID와 현재 시간을 조합하여 해시)
        String inviteCode = generateUniqueCode(userId);

        // 초대 정보 생성
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusHours(inviteExpiryHours);

        // 초대자 정보를 포함한 데이터 생성
        String inviteData = String.format(
            "{\"inviterId\":%d,\"createdAt\":\"%s\",\"expiresAt\":\"%s\",\"email\":\"%s\",\"name\":\"%s\"}",
            userId,
            now.format(DATE_FORMATTER),
            expiresAt.format(DATE_FORMATTER),
            user.getEmail(),
            user.getName()
        );

        // Redis에 초대 정보 저장
        // 1. 초대코드 -> 초대 정보 매핑
        redisTemplate.opsForValue().set(
            INVITE_KEY_PREFIX + "code:" + inviteCode,
            inviteData,
            inviteExpiryHours,
            TimeUnit.HOURS
        );

        // 2. 사용자 ID -> 초대코드 매핑 (사용자가 생성한 초대 코드 조회용)
        redisTemplate.opsForValue().set(
            userInviteKey,
            inviteCode,
            inviteExpiryHours,
            TimeUnit.HOURS
        );

        // 딥링크 생성 (두 가지 형식 모두 반환)
        String webUrl = baseUrl + "/couple/join/" + inviteCode;
//        String deepLinkUri = uriScheme + "://couple/join/" + inviteCode;

        // 안드로이드 인텐트 스키마로 딥링크 구성
        // 이 형식은 앱이 설치되어 있으면 앱으로, 없으면 웹으로 연결됩니다
        String androidDeepLink = "intent://couple/join/" + inviteCode +
            "#Intent;scheme=" + uriScheme +
            ";package=com.ssafy.loveledger;" +
            "S.browser_fallback_url=" + webUrl + ";" +
            "end";

        return androidDeepLink;
    }


    /**
     * 초대 코드를 사용 완료로 표시합니다.
     *
     * @param inviteCode 사용 완료로 표시할 초대 코드
     * @param inviteeId  초대를 수락한 사용자 ID
     * @return 초대자 ID (초대 정보에서 추출)
     */
    public Long useInviteCode(String inviteCode, Long inviteeId) {
        String key = INVITE_KEY_PREFIX + "code:" + inviteCode;
        String inviteData = redisTemplate.opsForValue().get(key);

        if (inviteData == null) {
            throw new IllegalArgumentException("유효하지 않은 초대 코드입니다");
        }

        // 간단한 방식으로 inviterId 추출 (실제로는 JSON 파싱 라이브러리 사용 권장)
        String inviterIdStr = inviteData.substring(
            inviteData.indexOf("\"inviterId\":") + 12,
            inviteData.indexOf(",", inviteData.indexOf("\"inviterId\":"))
        );

        Long inviterId = Long.parseLong(inviterIdStr);

        // 초대 코드 사용 처리 (Redis에서 삭제)
        redisTemplate.delete(key);
        redisTemplate.delete(INVITE_KEY_PREFIX + "user:" + inviterId);

        // 사용 기록 저장
        LocalDateTime usedAt = LocalDateTime.now();
        String usedData = String.format(
            "{\"inviterId\":%d,\"inviteeId\":%d,\"usedAt\":\"%s\"}",
            inviterId,
            inviteeId,
            usedAt.format(DATE_FORMATTER)
        );

        redisTemplate.opsForValue().set(
            INVITE_KEY_PREFIX + "used:" + inviteCode,
            usedData,
            30, // 사용 기록은 30일간 보관
            TimeUnit.DAYS
        );

        return inviterId;
    }


    /**
     * 사용자가 생성한 현재 활성화된 초대 링크를 조회합니다.
     *
     * @param userId 초대 링크를 조회할 사용자의 ID
     * @return 초대 링크 정보 (없을 경우 예외 발생)
     */
    public Map<String, Object> getCurrentInviteLink(Long userId) throws JsonProcessingException {
        // 사용자 정보 조회
        User user = userRepository.findById(userId)
            .orElseThrow(
                () -> new LoveLedgerException(ErrorCode.USER_NOT_FOUND, String.valueOf(userId)));

        // 사용자가 이미 커플 관계에 있는지 확인
        if (user.getCouple() != null) {
            throw new LoveLedgerException(ErrorCode.ALREADY_COUPLED, String.valueOf(userId));
        }

        // 사용자의 초대 코드 조회
        String userInviteKey = INVITE_KEY_PREFIX + "user:" + userId;
        String inviteCode = redisTemplate.opsForValue().get(userInviteKey);

        // 초대 코드에 대한 상세 정보 조회
        String inviteDataJson = redisTemplate.opsForValue()
            .get(INVITE_KEY_PREFIX + "code:" + inviteCode);

        // JSON 파싱
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode inviteData = objectMapper.readTree(inviteDataJson);

        // 만료 시간 확인
        LocalDateTime expiresAt = LocalDateTime.parse(
            inviteData.get("expiresAt").asText(),
            DateTimeFormatter.ISO_DATE_TIME
        );

        // 만료 확인
        boolean isExpired = LocalDateTime.now().isAfter(expiresAt);
        if (isExpired) {
            throw new LoveLedgerException(ErrorCode.INVITE_EXPIRED);
        }

        // 초대 링크 생성
        String webUrl = baseUrl + "/couple/join/" + inviteCode;
        String androidDeepLink = "intent://couple/join/" + inviteCode +
            "#Intent;scheme=" + uriScheme +
            ";package=com.ssafy.loveledger;" +
            "S.browser_fallback_url=" + webUrl + ";" +
            "end";

        // 결과 반환
        Map<String, Object> result = new HashMap<>();
        result.put("inviteCode", inviteCode);
        result.put("link", androidDeepLink);
        result.put("createdAt", inviteData.get("createdAt").asText());
        result.put("expiresAt", expiresAt.format(DATE_FORMATTER));
        result.put("remainingHours",
            java.time.Duration.between(LocalDateTime.now(), expiresAt).toHours());

        return result;

    }


    /**
     * 사용자 ID와 시간 정보를 바탕으로 고유한 초대 코드를 생성합니다.
     *
     * @param userId 사용자 ID
     * @return 해시 기반의 고유 코드
     */
    private String generateUniqueCode(Long userId) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String input = userId + "_" + System.currentTimeMillis();
            byte[] hash = digest.digest(input.getBytes());

            // Base64 URL Safe 인코딩 사용 (URL에 안전한 문자열로 변환)
            String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);

            // 첫 16자만 사용하여 짧은 코드 생성
            return encoded.substring(0, 16);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256을 지원하지 않는 환경에서는 간단한 대체 방법 사용
            String simpleCode = userId + "_" + System.currentTimeMillis();
            return Base64.getUrlEncoder().withoutPadding().encodeToString(simpleCode.getBytes())
                .substring(0, 16);
        }
    }

    /**
     * 사용자가 이미 커플 관계에 있는지 확인합니다.
     *
     * @param userId 확인할 사용자 ID
     * @return 커플 관계 여부
     */
    public boolean isUserAlreadyCoupled(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        return user.getCouple() != null;
    }

    /**
     * 초대 코드의 유효성을 검증하고 초대 정보를 반환합니다.
     *
     * @param inviteCode 검증할 초대 코드
     * @return 초대 정보 JSON 문자열 (유효하지 않은 경우 null)
     */
    public String validateInviteCode(String inviteCode) {
        String key = INVITE_KEY_PREFIX + "code:" + inviteCode;
        return redisTemplate.opsForValue().get(key);
    }


}

