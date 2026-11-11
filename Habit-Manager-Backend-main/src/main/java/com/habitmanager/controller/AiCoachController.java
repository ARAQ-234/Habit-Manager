package com.habitmanager.controller;

import com.habitmanager.service.AiCoachService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/coach")
public class AiCoachController {
    private final AiCoachService aiCoachService;

    public AiCoachController(AiCoachService aiCoachService) {
        this.aiCoachService = aiCoachService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(aiCoachService.getStatus());
    }

    @PostMapping
    public ResponseEntity<AiCoachService.CoachAdvice> generate(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(aiCoachService.generate(user.getUsername()));
    }
}
