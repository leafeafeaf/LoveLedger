package com.ssafy.loveledger.global.util;

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
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class GeminiUtil {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String backUrl;

    public GeminiUtil(RestTemplateBuilder restTemplateBuilder,
        @Value("${spring.gemini-ai.key}") String apiKey,
        @Value("${spring.gemini-ai.backend-url}") String backUrl) {
        this.restTemplate = restTemplateBuilder.build();
        this.apiKey = apiKey;
        this.backUrl = backUrl;
    }

    @Async
    public CompletableFuture<String> askGemini(String prompt) {
        return askGemini(prompt, "gemini-2.0-flash");  // 기본값 적용
    }

    @Async
    public CompletableFuture<String> askGemini(String prompt, String model) {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model
            + ":generateContent?key=" + apiKey;
        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Referer", backUrl);
        Map<String, Object> body = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        body.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request,
            String.class);

        return CompletableFuture.completedFuture(response.getBody());
    }

    //TODO 에러 전역 처리
    public Map<String, Object> mapResponseToMap(String response) {
        log.info("Gemini 응답 : {}", response);

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> resultMap = new HashMap<>();

        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode candidatesNode = rootNode.path("candidates");
            if (candidatesNode.isArray() && !candidatesNode.isEmpty()) {
                JsonNode contentNode = candidatesNode.get(0).path("content");
                JsonNode partsNode = contentNode.path("parts");
                if (partsNode.isArray() && !partsNode.isEmpty()) {
                    String text = partsNode.get(0).path("text").asText();

                    // 불필요한 코드 블록(````json` 및 ``` 제거)
                    text = text.replaceAll("^```json\\n|```$", "").trim();

                    // JSON 형식이면 HashMap으로 변환, 아니면 단순 텍스트 저장
                    try {
                        if (text.startsWith("{") && text.endsWith("}")) {
                            resultMap = objectMapper.readValue(text, HashMap.class);
                        } else {
                            resultMap.put("response", text);
                        }
                    } catch (Exception e) {
                        resultMap.put("error", "Invalid JSON format in content");
                    }
                } else {
                    resultMap.put("error", "No valid content found");
                }
            } else {
                resultMap.put("error", "No valid response found");
            }
        } catch (Exception e) {
            log.error(e.getMessage());
            resultMap.put("error", "Failed to parse response");
        }

        return resultMap;
    }
}
