package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.config.NgrokConfiguration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ngrok")
@RequiredArgsConstructor
public class NgrokController {

    private final NgrokConfiguration ngrokConfiguration;

    @Value("${ngrok.enabled:false}")
    private boolean ngrokEnabled;

    @Value("${server.port:8080}")
    private int serverPort;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getNgrokStatus() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("ngrokEnabled", ngrokEnabled);
        response.put("localUrl", "http://localhost:" + serverPort);
        
        if (ngrokEnabled) {
            String publicUrl = ngrokConfiguration.getPublicUrl();
            response.put("publicUrl", publicUrl);
            response.put("status", publicUrl != null ? "active" : "starting");
        } else {
            response.put("publicUrl", null);
            response.put("status", "disabled");
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, String>> getNgrokInfo() {
        Map<String, String> info = new HashMap<>();
        info.put("description", "Ngrok tunnel information");
        info.put("localUrl", "http://localhost:" + serverPort);
        
        if (ngrokEnabled) {
            String publicUrl = ngrokConfiguration.getPublicUrl();
            if (publicUrl != null) {
                info.put("publicUrl", publicUrl);
                info.put("message", "Ngrok tunnel is active. Use the public URL to access your backend from anywhere!");
            } else {
                info.put("message", "Ngrok tunnel is starting...");
            }
        } else {
            info.put("message", "Ngrok is disabled. Enable it by setting ngrok.enabled=true in application.properties");
        }
        
        return ResponseEntity.ok(info);
    }
} 