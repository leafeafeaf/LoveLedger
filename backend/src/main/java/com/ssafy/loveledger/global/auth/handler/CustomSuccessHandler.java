package com.ssafy.loveledger.global.auth.handler;

import com.ssafy.loveledger.domain.account.presentation.dto.request.MemberInfoRequest;
import com.ssafy.loveledger.domain.account.presentation.dto.response.MemberInfoResponse;
import com.ssafy.loveledger.domain.user.domain.User;
import com.ssafy.loveledger.domain.user.domain.repository.UserRepository;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.auth.util.JWTUtil;
import com.ssafy.loveledger.global.openai.dto.MemberRegistrationRequest;
import com.ssafy.loveledger.global.util.OpenFeignUtil;
import feign.FeignException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;
    private final OpenFeignUtil openFeignUtil;
    private final UserRepository userRepository;

    @Value("${ssafy.api-key}")
    private String apiKey;


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException, ServletException {

        CustomOAuth2User customUserDetail = (CustomOAuth2User) authentication.getPrincipal();
        String username = customUserDetail.getUsername();
        Long libraryId = customUserDetail.getLibraryId();
        Long userId = customUserDetail.getUserId();
        boolean isRegistered = customUserDetail.getIsRegistered();
        // 외부 API에서 사용자 정보 조회 또는 등록
        // 사용자 정보 조회

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        try {
            MemberInfoResponse memberInfo = getOrRegisterMemberInfo(user);
            log.info("SSAFY API 사용자 정보: {}", memberInfo);

            // 필요시 사용자 정보 업데이트
            if (memberInfo != null && memberInfo.getUserKey() != null) {
                user.setUserKey(memberInfo.getUserKey()); // User 엔티티에 userKey 필드가 있다고 가정
                userRepository.save(user);

                // userKey가 설정되면 isRegistered 업데이트
                isRegistered = isUserRegistrationComplete(user);
            }
        } catch (Exception e) {
            log.error("외부 API 연동 중 오류 발생: {}", e.getMessage(), e);
            // 외부 API 연동 실패시에도 인증 프로세스는 계속 진행
        }



        String access = jwtUtil.createJwt(userId, libraryId, "access", username, 1_800_000L);
        String refresh = jwtUtil.createJwt(userId, libraryId, "refresh", username, 86400000L);

        // Redis에 refresh 토큰 저장
        String redisKey = "token"+ userId;
        redisTemplate.opsForValue().set(redisKey, refresh);
        redisTemplate.expire(redisKey, 24 * 60 * 60, TimeUnit.SECONDS); // 24시간 유효

        response.addCookie(createCookie("refresh", refresh));
        // Access 토큰을 URL 프래그먼트로 전달 (URL 인코딩 추가)
        String encodedAccessToken = URLEncoder.encode(access, StandardCharsets.UTF_8);
        String redirectUrl = String.format("http://localhost:3000/#accessToken=%s&isRegistered=%s",
            encodedAccessToken,
            isRegistered
        );
        log.info(redirectUrl);

        response.sendRedirect(redirectUrl);
    }


    /**
     * 외부 API에서 사용자 정보를 조회하고, 없으면 등록하는 메서드
     */
    private MemberInfoResponse getOrRegisterMemberInfo(User user) {
        try {
            // 먼저 사용자 정보 조회 시도
            MemberInfoRequest request = MemberInfoRequest.builder()
                .apiKey(apiKey)
                .userId(user.getEmail())
                .build();

            log.info("SSAFY API 사용자 정보 조회 요청: {}", request);
            MemberInfoResponse response = openFeignUtil.getMemberInfo(request);
            log.info("외부 API 사용자 정보 조회 성공: {}", response);
            return response;
        } catch (FeignException e) {
            log.info("SSAFY API 사용자 정보 조회 실패: {} - {}", e.status(), e.contentUTF8());
            // 사용자가 없는 경우(404 등), 새로 등록
            if (e.status() == 400 || isUserNotFoundError(e)) {
                log.info("사용자가 SSAFY API에 등록되어 있지 않습니다. 등록을 시도합니다.");
                return registerMember(user);
            } else {
                // 다른 예외는 그대로 throw
                throw new RuntimeException("SSAFY API 연동 중 오류 발생: " + e.getMessage(), e);
            }
        }
    }

    /**
     * FeignException에서 사용자를 찾을 수 없는 에러인지 확인
     */
    private boolean isUserNotFoundError(FeignException e) {
        // 응답 본문이나 에러 메시지를 확인하여 사용자를 찾을 수 없는 에러인지 판단
        // 실제 API 응답 형식에 맞게 구현 필요
        String responseBody = e.contentUTF8();
        return responseBody.contains("user not found") ||
            responseBody.contains("사용자를 찾을 수 없습니다") ||
            responseBody.contains("no such user");
    }

    /**
     * 외부 API에 새 사용자 등록 메서드
     */
    private MemberInfoResponse registerMember(User user) {
        try {
            // 회원 등록 요청 생성
            MemberRegistrationRequest registrationRequest = MemberRegistrationRequest.builder()
                .apiKey(apiKey)
                .userId(user.getEmail())
                .build();

            log.info("SSAFY API 사용자 등록 요청: {}", registrationRequest);

            // 회원 등록 API 호출
            MemberInfoResponse registrationResponse = openFeignUtil.registerMember(registrationRequest);
            log.info("SSAFY API 사용자 등록 성공: {}", registrationResponse);

            // 등록 성공 시 바로 응답 객체 생성하여 반환 (추가 API 호출 없이)
            MemberInfoResponse response = new MemberInfoResponse();
            response.setUserId(registrationResponse.getUserId());
            response.setUserKey(registrationResponse.getUserKey());

            return response;
        } catch (FeignException e) {
            log.error("SSAFY API 사용자 등록 실패: {} - {}", e.status(), e.contentUTF8());

            // 이미 존재하는 ID인 경우, 다시 정보 조회 시도
            if (e.status() == 400 && e.contentUTF8().contains("E4002")) {
                log.info("이미 존재하는 ID입니다. 정보를 다시 조회합니다.");

                MemberInfoRequest infoRequest = MemberInfoRequest.builder()
                    .apiKey(apiKey)
                    .userId(user.getEmail())
                    .build();

                return openFeignUtil.getMemberInfo(infoRequest);
            }

            throw new RuntimeException("SSAFY API 사용자 등록 중 오류 발생: " + e.getMessage(), e);
        }
    }

    /**
     * 사용자의 회원가입 상태가 완료되었는지 확인
     */
    private boolean isUserRegistrationComplete(User user) {
        // 필수 정보가 모두 있는지 확인
        boolean isComplete = user.getName() != null
            && user.getBirthDay() != null
            && user.getGender() != null
            && user.getIsMarried() != null
            && user.getUserKey() != null; // SSAFY API 연동 키 추가

        log.info("회원가입 상태 체크 - name: {}, birthDay: {}, gender: {}, isMarried: {}, userKey: {}, isComplete: {}",
            user.getName(), user.getBirthDay(), user.getGender(), user.getIsMarried(), user.getUserKey(), isComplete);

        return isComplete;
    }



    private Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24 * 60 * 60);
        //    cookie.setSecure(true); // https
        cookie.setPath("/");
        cookie.setHttpOnly(true);

        return cookie;


    }
}
