package com.habitmanager.controller;

import com.habitmanager.entity.Reminder;
import com.habitmanager.service.ReminderService;
import com.habitmanager.dao.ReminderRequest;
import com.habitmanager.dao.ReminderResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

    @GetMapping
    public ResponseEntity<List<ReminderResponse>> getUserReminders(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reminderService.getUserReminders(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<ReminderResponse> createReminder(@Valid @RequestBody ReminderRequest request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reminderService.createReminder(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReminderResponse> updateReminder(@PathVariable Long id, @Valid @RequestBody ReminderRequest request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reminderService.updateReminder(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        reminderService.deleteReminder(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingReminders(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reminderService.getPendingReminders(userDetails.getUsername()));
    }

    // ရှိပြီးသား reminder အတွက် respond (keep for compatibility)
    @PostMapping("/{id}/respond")
    public ResponseEntity<?> respondToReminder(@PathVariable Long id, @RequestBody String response,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        reminderService.respondToReminder(id, response.replace("\"", ""), userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
