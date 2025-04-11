package com.ssafy.mvcservice.domain.couple.presentation;

import com.ssafy.mvcservice.domain.couple.service.CoupleService;
import com.ssafy.mvcservice.domain.user.domain.User;
import com.ssafy.mvcservice.global.common.ApiResponse;
import com.ssafy.mvcservice.global.response.exception.ErrorCode;
import com.ssafy.mvcservice.global.response.exception.LoveLedgerException;
import com.ssafy.mvcservice.global.util.UserUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/couple")
public class CoupleController {

    private final CoupleService coupleService;
    private final UserUtil userUtil;

    /**
     *
     */
    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<ApiResponse<Object>> joinCouple(
        @PathVariable String inviteCode,
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);
        if (user == null) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS, "인증 정보가 올바르지 않습니다.");
        }

        Long userId = user.getId();

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
        HttpServletRequest request
    ) {
        /*
            해당 커플 Id값을 가져와서 해당 커플에 DB를 지우고, 연동 되어있는 유저에 값을 지우면된다.
        */
        User user = userUtil.getCurrentUser(request);
        if (user == null) {
            throw new LoveLedgerException(ErrorCode.FORBIDDEN_ACCESS, "인증 정보가 올바르지 않습니다.");
        }

        Long userId = user.getId();

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