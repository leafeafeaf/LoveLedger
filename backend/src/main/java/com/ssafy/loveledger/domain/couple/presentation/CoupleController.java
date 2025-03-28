package com.ssafy.loveledger.domain.couple.presentation;

import com.ssafy.loveledger.domain.couple.service.CoupleService;
import com.ssafy.loveledger.global.auth.dto.request.CustomOAuth2User;
import com.ssafy.loveledger.global.common.ApiResponse;
import com.ssafy.loveledger.global.response.exception.ErrorCode;
import com.ssafy.loveledger.global.response.exception.LoveLedgerException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS, "인증 정보가 올바르지 않습니다.");
        }

        Long userId = oAuth2User.getUserId();

        // 이미 커플인지 체크하고, 커플이면 예외처리
        coupleService.validateUserNotAlreadyCoupled(userId);
        // 커플 연동 처리
        coupleService.createCouple(inviteCode, userId);

        ApiResponse<Object> response = ApiResponse.builder()
            .status("200")
            .message("연동 완료")
            .data(null)
            .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
            .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{coupleId}")
    public ResponseEntity<ApiResponse<Object>> deleteCouple(
        @PathVariable Long coupleId,
        @AuthenticationPrincipal CustomOAuth2User oAuth2User
    ) {
        /*
            해당 커플 Id값을 가져와서 해당 커플에 DB를 지우고, 연동 되어있는 유저에 값을 지우면된다.
        */
        if (oAuth2User == null) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS, "인증 정보가 없습니다.");
        }
        Long userId = oAuth2User.getUserId();

        coupleService.deleteCouple(coupleId, userId);

        return ResponseEntity.ok(
            ApiResponse.builder()
                .status("200")
                .message("커플 연동 해제가 완료되었습니다.")
                .data(null)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build()
        );

    }

}