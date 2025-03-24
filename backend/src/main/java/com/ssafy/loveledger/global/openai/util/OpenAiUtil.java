package com.ssafy.loveledger.global.openai.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

//TODO msa 적용
@Slf4j
@Service
public class OpenAiUtil {

    private final RestTemplate restTemplate;
    private final String apiKey;

    public OpenAiUtil(RestTemplateBuilder restTemplateBuilder,
        @Value("${spring.open-ai.key}") String apiKey) {
        this.restTemplate = restTemplateBuilder.build();
        this.apiKey = apiKey;
    }

    @Async
    public CompletableFuture<String> askChatGpt(String prompt) {
        return askChatGpt(prompt, "gpt-4o-mini");  // 기본값 적용
    }

    @Async
    public CompletableFuture<String> askChatGpt(String prompt, String model) {
        String apiUrl = "https://api.openai.com/v1/chat/completions";
        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(Map.of("role", "user", "content", prompt)));
        body.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request,
            String.class);

        return CompletableFuture.completedFuture(response.getBody());
    }


    public Map<String, Object> mapResponseToMap(String response) {
        log.info("chatgpt 응답 : {}", response);

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> resultMap = new HashMap<>();

        try {
            // JSON 문자열을 JsonNode 객체로 변환
            JsonNode rootNode = objectMapper.readTree(response);

            // OpenAI 응답에서 'choices' 배열의 첫 번째 요소에서 'message' -> 'content' 값 추출
            JsonNode choicesNode = rootNode.path("choices");
            if (choicesNode.isArray() && !choicesNode.isEmpty()) {
                JsonNode messageNode = choicesNode.get(0).path("message");
                String content = messageNode.path("content").asText();

                // content가 JSON 형식이면 HashMap으로 변환
                try {
                    resultMap = objectMapper.readValue(content, HashMap.class);
                } catch (Exception e) {
                    resultMap.put("error", "Invalid JSON format in content");
                }
            } else {
                resultMap.put("error", "No valid content found");
            }
        } catch (Exception e) {
            log.error(e.getMessage());
            resultMap.put("error", "Failed to parse response");
        }

        return resultMap;
    }
}
