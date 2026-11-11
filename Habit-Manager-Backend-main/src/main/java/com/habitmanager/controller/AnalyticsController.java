package com.habitmanager.controller;

import com.habitmanager.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/weekly")
    public ResponseEntity<Map<Integer, Map<String, Object>>> getAllWeeklyAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(analyticsService.getWeeklyAnalyticsForUser(userDetails.getUsername()));
    }

    @GetMapping("/weekly/{habitId}")
    public ResponseEntity<Map<String, Object>> getWeeklyAnalytics(@PathVariable Integer habitId,
                                                                  @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> analytics = analyticsService.getWeeklyAnalytics(habitId, userDetails.getUsername());
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyAnalytics(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @AuthenticationPrincipal UserDetails userDetails) {
        if ((year == null) != (month == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide both year and month, or neither");
        }
        return ResponseEntity.ok(analyticsService.getMonthlyAnalyticsForUser(userDetails.getUsername(), year, month));
    }
}
