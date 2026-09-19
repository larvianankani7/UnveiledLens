package com.unveiledlens.verification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SmsService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendOtp(String to, String otp) {
        String providerUrl = System.getenv("SMS_PROVIDER_URL");
        String providerApiKey = System.getenv("SMS_PROVIDER_API_KEY");
        String senderId = System.getenv("SMS_SENDER_ID");

        if (providerUrl == null || providerUrl.isBlank()) {
            throw new IllegalStateException(
                    "SMS_PROVIDER_URL is not configured."
            );
        }

        if (providerApiKey == null || providerApiKey.isBlank()) {
            throw new IllegalStateException(
                    "SMS_PROVIDER_API_KEY is not configured."
            );
        }

        String messageText =
                "Your UnveiledLens verification code is: " + otp +
                ". It expires in 10 minutes.";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(providerApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("to", to);
        body.put("message", messageText);

        if (senderId != null && !senderId.isBlank()) {
            body.put("senderId", senderId);
        }

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                providerUrl,
                HttpMethod.POST,
                request,
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException(
                    "SMS provider rejected the OTP request. HTTP status: "
                            + response.getStatusCode().value()
            );
        }
    }
}

