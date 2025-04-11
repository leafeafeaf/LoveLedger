package com.ssafy.webfluxservice;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping
public class WebfluxTestController {

    @GetMapping("/hello")
    public Mono<String> hello(ServerHttpRequest request) {
        String userId = request.getHeaders().getFirst("X-User-Id");
        String username = request.getHeaders().getFirst("X-Username");
        String libraryId = request.getHeaders().getFirst("X-Library-Id");

        return Mono.just(
            "Hello from WebFlux, userId = " + userId + ", username = " + username + " libraryId = "
                + libraryId);
    }
}