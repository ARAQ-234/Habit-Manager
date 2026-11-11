package com.habitmanager.controller;

import com.habitmanager.service.StreakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/streak")
public class StreakController {

    @Autowired
    private StreakService streakService;

    @GetMapping
    public ResponseEntity<Map<Integer, Integer>> getAllStreaks(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(streakService.getCurrentStreaks(userDetails.getUsername()));
    }

    @GetMapping("/{habitId}")
    public ResponseEntity<Integer> getStreak(@PathVariable Integer habitId,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        int streak = streakService.getCurrentStreak(habitId, userDetails.getUsername());
        return ResponseEntity.ok(streak);
    }
}
