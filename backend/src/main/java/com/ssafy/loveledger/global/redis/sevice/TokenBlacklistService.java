package com.ssafy.loveledger.global.redis.sevice;


import com.ssafy.loveledger.global.auth.util.JWTUtil;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;
    private final JWTUtil jwtUtil;


    //토큰을 블랙리스트에 추가
    public void addToBlacklist(String token, long expiration) {
        String key = "blacklist :" + token;
        redisTemplate.opsForValue().set(key, "blacklisted");
        redisTemplate.expire(key, expiration, TimeUnit.MICROSECONDS);
    }

    // 로그아웃 시 액세스 토큰과 리프레쉬 토큰 모두 블랙리스트에 추가
    public void blacklistUserTokens(String accessToken, String refreshToken) {
        try {
            // 액세스 토큰 남은 만료 시간 계산
            long accessExpiry = jwtUtil.getExpirationTime(accessToken) - System.currentTimeMillis();
            if (accessExpiry > 0) {
                addToBlacklist(accessToken, accessExpiry);
            }

            //리프레쉬 토큰 남은 만료시간 계산
            long refreshExpiry =
                jwtUtil.getExpirationTime(refreshToken) - System.currentTimeMillis();
            if (refreshExpiry > 0) {
                addToBlacklist(refreshToken, refreshExpiry);
            }
        } catch (Exception e) {
            // 토큰 파싱 에러 처리
        }
    }

    // 토큰이 블랙리스트에 있는지 확인
    public boolean isBlacklisted(String token) {
        String key = "blacklist:" + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}