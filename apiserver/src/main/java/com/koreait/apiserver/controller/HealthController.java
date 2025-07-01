package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("timestamp", LocalDateTime.now());
        healthData.put("service", "TheBridgeHub API Server");
        healthData.put("version", "1.0.0");
        healthData.put("port", 7100);
        
        return ResponseEntity.ok(ApiResponse.success(healthData));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> simpleHealthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(status);
    }
} 