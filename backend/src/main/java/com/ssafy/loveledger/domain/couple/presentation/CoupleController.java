package com.ssafy.loveledger.domain.couple.presentation;

import com.ssafy.loveledger.domain.couple.service.CoupleService;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.common.ApiResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/couple")
public class CoupleController {

    private final CoupleService coupleService;

    /**
     * 초대 링크를 통해 부부 연동을 완료합니다.
     *
     * @param inviteCode 초대 코드 (Path Variable)
     * @param oAuth2User 인증된 사용자 정보
     * @return 연동 결과
     */
    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<ApiResponse<Object>> joinCouple(
        @PathVariable String inviteCode,
        @AuthenticationPrincipal CustomOAuth2User oAuth2User) {

        if (oAuth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.builder()
                    .status("401")
                    .message("인증 정보가 올바르지 않습니다")
                    .data(null)
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build());
        }

        Long userId = oAuth2User.getUserId();

        try {
            // 사용자가 이미 커플 관계인지 확인
            boolean isAlreadyCoupled = coupleService.isUserAlreadyCoupled(userId);
            if (isAlreadyCoupled) {
                // 커플 등록 시간 조회
                LocalDateTime registeredAt = coupleService.getCoupleRegisteredTime(userId);

                Map<String, String> data = new HashMap<>();
                data.put("registeredAt", registeredAt.format(DateTimeFormatter.ISO_DATE_TIME));

                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.builder()
                        .status("409")
                        .message("이미 연동되어 있는 계정입니다.")
                        .data(data)
                        .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                        .build());
            }

            // 커플 연동 처리
            coupleService.createCouple(inviteCode, userId);

            return ResponseEntity.ok(
                ApiResponse.builder()
                    .status("200")
                    .message("연동 완료")
                    .data(null)
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build()
            );

        } catch (IllegalArgumentException e) {
            // 잘못된 초대 코드
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.builder()
                    .status("400")
                    .message(e.getMessage())
                    .data(null)
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build());
        } catch (IllegalStateException e) {
            // 이미 사용된 초대 코드 등 상태 오류
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.builder()
                    .status("409")
                    .message(e.getMessage())
                    .data(null)
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build());
        } catch (Exception e) {
            // 기타 서버 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.builder()
                    .status("500")
                    .message("서버 오류가 발생했습니다: " + e.getMessage())
                    .data(null)
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build());
        }
    }
}