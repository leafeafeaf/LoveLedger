package com.ssafy.loveledger.domain.user.presentation;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping
    public Map<String, String> getMyRoute() {
        // 단순 문자열 대신 객체 반환
        Map<String, String> response = new HashMap<>();
        response.put("message", "my route");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));

        return response;
    }

}
