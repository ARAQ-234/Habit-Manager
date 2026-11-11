package com.habitmanager.controller;

import com.habitmanager.entity.HistoryLog;
import com.habitmanager.entity.User;
import com.habitmanager.repository.UserRepository;
import com.habitmanager.service.HistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    @Autowired
    private HistoryService historyService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<HistoryLog>> getUserHistory(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(historyService.getUserHistory(user));
    }
}
