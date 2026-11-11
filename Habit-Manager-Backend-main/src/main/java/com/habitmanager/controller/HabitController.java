package com.habitmanager.controller;

import com.habitmanager.dao.HabitDAO;
import com.habitmanager.dao.MessageResponse;
import com.habitmanager.entity.Habit;
import com.habitmanager.service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    @Autowired
    private HabitService habitService;

    @GetMapping
    public ResponseEntity<List<Habit>> getUserHabits(@RequestParam(defaultValue = "false") boolean archived,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(habitService.getUserHabits(userDetails.getUsername(), archived));
    }

    @PostMapping
    public ResponseEntity<Habit> createHabit(@Valid @RequestBody HabitDAO habitDAO,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        Habit habit = habitService.createHabit(habitDAO, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(habit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable Integer id,
                                             @Valid @RequestBody HabitDAO habitDAO,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        Habit habit = habitService.updateHabit(id, habitDAO, userDetails.getUsername());
        return ResponseEntity.ok(habit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHabit(@PathVariable Integer id,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        habitService.deleteHabit(id, userDetails.getUsername());
        return ResponseEntity.ok(new MessageResponse("Habit deleted successfully"));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Habit> archiveHabit(@PathVariable Integer id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(habitService.setArchived(id, true, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Habit> restoreHabit(@PathVariable Integer id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(habitService.setArchived(id, false, userDetails.getUsername()));
    }
}
