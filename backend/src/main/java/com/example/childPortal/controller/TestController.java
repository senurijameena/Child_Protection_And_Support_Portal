package com.example.childPortal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> testAuth(@AuthenticationPrincipal String userId) {
        Map<String, Object> response = new HashMap<>();
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        response.put("authenticated", auth != null && auth.isAuthenticated());
        response.put("userId", userId);
        response.put("principal", auth != null ? auth.getPrincipal() : null);
        response.put("authorities", auth != null ? auth.getAuthorities().toString() : null);
        response.put("name", auth != null ? auth.getName() : null);
        
        return ResponseEntity.ok(response);
    }
}

