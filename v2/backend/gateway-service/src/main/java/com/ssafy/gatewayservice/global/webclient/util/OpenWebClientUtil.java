package com.ssafy.gatewayservice.global.webclient.util;

import com.ssafy.gatewayservice.global.webclient.dto.request.MemberInfoRequest;
import com.ssafy.gatewayservice.global.webclient.dto.request.MemberRegistrationRequest;
import com.ssafy.gatewayservice.global.webclient.dto.response.MemberInfoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenWebClientUtil {

    private final WebClient webClient;
    @Value("${ssafy.apiKey}")
    private String apiKey;

    public Mono<MemberInfoResponse> getMemberInfo(MemberInfoRequest request) {
        log.info("GET MEMBER INFO: {}", request);

        return webClient.post()
            .uri("/member/search")
            .bodyValue(request)
            .retrieve()
            .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                clientResponse -> clientResponse.createException().flatMap(Mono::error))
            .bodyToMono(MemberInfoResponse.class);
    }

    public Mono<MemberInfoResponse> registerMember(MemberRegistrationRequest request) {
        request.setApiKey(apiKey);
        log.info("REGISTER MEMBER: {}", request);

        return webClient.post()
            .uri("/member")
            .bodyValue(request)
            .retrieve()
            .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                clientResponse -> clientResponse.createException().flatMap(Mono::error))
            .bodyToMono(MemberInfoResponse.class);
    }

    // 사용자 존재 여부 확인 후 등록 시도
    public Mono<MemberInfoResponse> getOrRegisterMemberInfo(String userEmail) {
        log.info("키 : {} / 이메일 : {}", apiKey, userEmail);

        MemberInfoRequest request = MemberInfoRequest.builder()
            .userId(userEmail)
            .apiKey(apiKey)
            .build();

        return getMemberInfo(request)
            .onErrorResume(WebClientResponseException.class, e -> {
                log.warn("사용자 조회 실패: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
                if (e.getStatusCode() == HttpStatus.BAD_REQUEST && isUserNotFoundError(e)) {
                    log.info("사용자 없음 → 등록 시도");
                    MemberRegistrationRequest registerReq = MemberRegistrationRequest.builder()
                        .userId(userEmail)
                        .build();
                    return registerMember(registerReq);
                }
                return Mono.error(e); // 그 외 에러는 그대로 throw
            });
    }

    private boolean isUserNotFoundError(WebClientResponseException e) {
        String response = e.getResponseBodyAsString();
        return response.contains("user not found") ||
            response.contains("사용자를 찾을 수 없습니다") ||
            response.contains("no such user");
    }
}
