package com.ssafy.loveledger.domain.user.presentation;

import com.ssafy.loveledger.domain.user.service.UserService;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/")
public class Oauth2Controller {

    private final UserService userService;


    @GetMapping
    public Map<String, String> getMyRoute() {
        // 단순 문자열 대신 객체 반환
        Map<String, String> response = new HashMap<>();
        response.put("message", "my route");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));

        return response;
    }
}