package com.eduai.backend_java.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EduAiController {

    // This URL points directly to your running Python AI microservice
    private final String FLASK_API_URL = "http://localhost:5000/api/ml/predict";

    @GetMapping("/status")
    public Map<String, String> getSystemStatus() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Java Backend is online and ready on Port 8080!");
        return response;
    }

    // React will hit this endpoint when a user clicks "Analyze"
    @PostMapping("/placement/analyze")
    public ResponseEntity<String> analyzePlacement(@RequestBody Map<String, Object> studentData) {
        System.out.println("1. Received request from React. Forwarding to Python AI...");

        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // 2. Send the data to Python on Port 5000
            ResponseEntity<String> flaskResponse = restTemplate.postForEntity(FLASK_API_URL, studentData, String.class);

            System.out.println("2. Received AI prediction from Python. Sending back to React.");
            
            // 3. Send the exact Python result back to the React UI
            return ResponseEntity.ok(flaskResponse.getBody());
            
        } catch (Exception e) {
            System.out.println("Error connecting to Python Flask: " + e.getMessage());
            return ResponseEntity.status(500).body("{\"error\": \"AI Microservice is offline. Is Flask running?\"}");
        }
    }
}