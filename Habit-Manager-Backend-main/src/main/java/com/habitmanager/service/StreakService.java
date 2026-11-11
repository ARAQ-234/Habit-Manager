package com.habitmanager.service;

import com.habitmanager.entity.Habit;
import com.habitmanager.entity.HabitLog;
import com.habitmanager.entity.LogStatus;
import com.habitmanager.repository.HabitLogRepository;
import com.habitmanager.repository.HabitRepository;
import com.habitmanager.repository.UserRepository;
import com.habitmanager.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class StreakService {

    @Autowired
    private HabitLogRepository logRepository;

    @Autowired
    private HabitRepository habitRepository;
    @Autowired
    private UserRepository userRepository;

    public int getCurrentStreak(Integer habitId, String username) {
        Habit habit = habitRepository.findByIdAndUser_Username(habitId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));
        LocalDate today = LocalDate.now(ZoneId.of(habit.getUser().getTimeZone()));
        List<HabitLog> logs = logRepository.findByHabitAndCheckInDateBetween(habit, today.minusDays(365), today);
        return calculate(habit, logs);
    }

    public Map<Integer, Integer> getCurrentStreaks(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        List<Habit> habits = habitRepository.findByUserAndArchived(user, false);
        LocalDate today = LocalDate.now(ZoneId.of(user.getTimeZone()));
        List<HabitLog> logs = logRepository.findByHabit_UserAndCheckInDateBetween(user, today.minusDays(365), today);
        Map<Integer, List<HabitLog>> grouped = logs.stream().collect(Collectors.groupingBy(log -> log.getHabit().getId()));
        Map<Integer, Integer> result = new java.util.LinkedHashMap<>();
        for (Habit habit : habits) result.put(habit.getId(), calculate(habit, grouped.getOrDefault(habit.getId(), List.of())));
        return result;
    }

    private int calculate(Habit habit, List<HabitLog> logs) {
        Map<LocalDate, HabitLog> logsByDate = logs.stream().collect(Collectors.toMap(HabitLog::getCheckInDate, Function.identity(), (first, second) -> first));
        int streak = 0;
        LocalDate date = LocalDate.now(ZoneId.of(habit.getUser().getTimeZone()));
        if (habit.getEndDate() != null && habit.getEndDate().isBefore(date)) return 0;
        LocalDate createdDate = habit.getCreatedAt() == null ? date : habit.getCreatedAt().toLocalDate();
        // A scheduled habit's streak stays visible until the current day has ended.
        if (habit.isScheduledOn(date) && !logsByDate.containsKey(date)) date = date.minusDays(1);
        for (int daysChecked = 0; daysChecked < 366 && !date.isBefore(createdDate); daysChecked++, date = date.minusDays(1)) {
            if (!habit.isScheduledOn(date)) continue;
            HabitLog log = logsByDate.get(date);
            if (log == null || log.getStatus() != LogStatus.SUCCESS) break;
            streak++;
        }
        return streak;
    }
}
