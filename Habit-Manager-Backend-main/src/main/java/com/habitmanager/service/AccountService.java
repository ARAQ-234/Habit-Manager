package com.habitmanager.service;

import com.habitmanager.dao.AccountSettingsRequest;
import com.habitmanager.dao.AccountSettingsResponse;
import com.habitmanager.entity.Habit;
import com.habitmanager.entity.User;
import com.habitmanager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.DateTimeException;
import java.util.Map;

@Service
public class AccountService {
    @Autowired private UserRepository userRepository;
    @Autowired private HabitRepository habitRepository;
    @Autowired private HabitLogRepository logRepository;
    @Autowired private HabitNoteRepository noteRepository;
    @Autowired private HabitScheduleRepository scheduleRepository;
    @Autowired private ReminderRepository reminderRepository;
    @Autowired private ReminderRecordRepository reminderRecordRepository;
    @Autowired private HistoryLogRepository historyLogRepository;
    @Autowired private PasswordResetTokenRepository resetTokenRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public AccountSettingsResponse getSettings(String username) {
        return toResponse(findUser(username));
    }

    @Transactional
    public AccountSettingsResponse updateSettings(String username, AccountSettingsRequest request) {
        User user = findUser(username);
        try { ZoneId.of(request.getTimeZone()); }
        catch (DateTimeException exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid time zone"); }
        user.setTimeZone(request.getTimeZone());
        return toResponse(userRepository.save(user));
    }

    public Map<String, Object> exportData(String username) {
        User user = findUser(username);
        return Map.of(
                "exportedAt", LocalDateTime.now(),
                "account", toResponse(user),
                "habits", habitRepository.findByUser(user),
                "checkIns", logRepository.findByHabit_User_UsernameOrderByCheckInDateDesc(username),
                "reminders", reminderRepository.findByHabit_User_Username(username),
                "activity", historyLogRepository.findByUserOrderByTimestampDesc(user)
        );
    }

    @Transactional
    public void deleteAccount(String username, String password) {
        User user = findUser(username);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            // A failed password confirmation is not an expired/invalid login session.
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The password you entered is incorrect");
        }
        resetTokenRepository.deleteByUser_Id(user.getId());
        historyLogRepository.deleteByUser(user);
        for (Habit habit : habitRepository.findByUser(user)) {
            logRepository.deleteByHabit_Id(habit.getId());
            noteRepository.deleteByHabit_Id(habit.getId());
            scheduleRepository.deleteByHabit_Id(habit.getId());
            reminderRepository.deleteByHabit_Id(habit.getId());
            reminderRecordRepository.deleteByHabit_Id(habit.getId());
        }
        habitRepository.deleteAll(habitRepository.findByUser(user));
        userRepository.delete(user);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
    }

    private AccountSettingsResponse toResponse(User user) {
        return new AccountSettingsResponse(user.getId(), user.getUsername(), user.getEmail(), user.getTimeZone());
    }
}
