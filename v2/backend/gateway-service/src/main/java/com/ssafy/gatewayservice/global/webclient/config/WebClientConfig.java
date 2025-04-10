package com.ssafy.gatewayservice.global.webclient.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${ssafy.url}")
    String baseUrl;

    @Bean
    public WebClient webClient() {
        return WebClient.builder()
            .baseUrl(baseUrl) // Eureka 사용 시 lb://openai-service 도 가능
            .build();
    }
}