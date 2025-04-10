package com.ssafy.mvcservice.domain.invite.presentation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mvcservice.domain.invite.presentation.dto.response.InviteLinkResponse;
import com.ssafy.mvcservice.domain.invite.presentation.dto.response.InviteValidationResponse;
import com.ssafy.mvcservice.domain.invite.service.InviteService;
import com.ssafy.mvcservice.domain.user.domain.User;
import com.ssafy.mvcservice.global.common.ApiResponse;
import com.ssafy.mvcservice.global.util.UserUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/invite")
public class InviteController {

    private final InviteService inviteService;
    private final ObjectMapper objectMapper;
    private final UserUtil userUtil;

    /**
     * 배우자 초대 링크를 생성합니다.
     *
     * @return 생성된 초대 링크
     */
    @GetMapping
    public ResponseEntity<ApiResponse<InviteLinkResponse>> generateInviteLink(
        HttpServletRequest request) {
        User user = userUtil.getCurrentUser(request);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                ApiResponse.<InviteLinkResponse>builder()
                    .status("401")
                    .message("인증 정보가 올바르지 않습니다")
                    .timestamp(LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build()
            );
        }

        // 현재 로그인한 사용자의 ID를 가져옵니다
        Long userId = user.getId();

        // 초대 링크 생성
        String inviteLink = inviteService.generateInviteLink(userId);

        // 응답 생성
        InviteLinkResponse response = InviteLinkResponse.builder()
            .link(inviteLink)
            .build();

        return ResponseEntity.ok(
            ApiResponse.<InviteLinkResponse>builder()
                .status("200")
                .message("정상적으로 반환하였습니다.")
                .data(response)
                .timestamp(LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                .build()
        );
    }


    @GetMapping("/validate/{inviteCode}")
    public ResponseEntity<ApiResponse<InviteValidationResponse>> validateInviteLink(
        @PathVariable String inviteCode,
        HttpServletRequest request) {

        User user = userUtil.getCurrentUser(request);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<InviteValidationResponse>builder()
                    .status("401")
                    .message("인증 정보가 올바르지 않습니다")
                    .timestamp(LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build());
        }

        Long userId = user.getId();

        // 사용자가 이미 커플 관계에 있는지 확인
        boolean isAlreadyCoupled = inviteService.isUserAlreadyCoupled(userId);
        if (isAlreadyCoupled) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<InviteValidationResponse>builder()
                    .status("400")
                    .message("이미 연인과 연결된 상태입니다.")
                    .timestamp(LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build());
        }

        // 초대 코드 유효성 검증
        String inviteDataJson = inviteService.validateInviteCode(inviteCode);

        // 초대 링크가 존재하지 않음
        if (inviteDataJson == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<InviteValidationResponse>builder()
                    .status("404")
                    .message("해당 사용자에게 활성화된 초대 링크가 없습니다.")
                    .timestamp(LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build());
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode inviteData = objectMapper.readTree(inviteDataJson);

            // 만료 시간 확인
            LocalDateTime expiresAt = LocalDateTime.parse(
                inviteData.get("expiresAt").asText(), // 문자열로 안전하게 가져옴
                DateTimeFormatter.ISO_DATE_TIME
            );

            if (LocalDateTime.now().isAfter(expiresAt)) {
                return ResponseEntity.status(HttpStatus.GONE)
                    .body(ApiResponse.<InviteValidationResponse>builder()
                        .status("410")
                        .message("초대 링크가 만료되었습니다.")
                        .timestamp(LocalDateTime.now()
                            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                        .build());
            }
            Long inviterId = inviteData.get("inviterId").asLong();

            // 초대자 정보 추출 (항상 asText()를 사용하여 문자열로 안전하게 변환)
            String inviterEmail = inviteData.get("email").asText();
            String inviterName = inviteData.get("name").asText();

            // 응답 생성
            InviteValidationResponse response = InviteValidationResponse.builder()
                .email(inviterEmail)
                .name(inviterName)
                .build();

            return ResponseEntity.ok(
                ApiResponse.<InviteValidationResponse>builder()
                    .status("200")
                    .message("아직 유효한 링크입니다.")
                    .data(response)
                    .timestamp(LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build()
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<InviteValidationResponse>builder()
                    .status("500")
                    .message("초대 링크 검증 중 오류가 발생했습니다: " + e.getMessage())
                    .timestamp(LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'T'")))
                    .build());
        }
    }
}
