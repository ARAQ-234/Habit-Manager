package com.habitmanager.controller;

import com.habitmanager.dao.LogDAO;
import com.habitmanager.entity.HabitLog;
import com.habitmanager.entity.User;
import com.habitmanager.repository.UserRepository;
import com.habitmanager.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private LogService logService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/checkin")
    public ResponseEntity<HabitLog> checkIn(@Valid @RequestBody LogDAO dto,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        HabitLog log = logService.checkIn(dto.getHabitId(), dto.getCompletedCount(), dto.getDate(), userDetails.getUsername());
        return ResponseEntity.ok(log);
    }

    @GetMapping("/range")
    public ResponseEntity<List<HabitLog>> getLogsBetween(@RequestParam String start,
                                                         @RequestParam String end,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        if (endDate.isBefore(startDate) || startDate.isBefore(endDate.minusDays(366))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date range must be ordered and no longer than 366 days");
        }
        List<HabitLog> logs = logService.getLogsByUserAndDateRange(user, startDate, endDate);
        return ResponseEntity.ok(logs);
    }
}
