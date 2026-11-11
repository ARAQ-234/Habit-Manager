package com.habitmanager.service;

import com.habitmanager.entity.Habit;
import com.habitmanager.entity.HabitLog;
import com.habitmanager.entity.LogStatus;
import com.habitmanager.entity.User;
import com.habitmanager.repository.HabitLogRepository;
import com.habitmanager.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.time.ZoneId;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class LogService {

    @Autowired
    private HabitLogRepository logRepository;

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HistoryService historyService;

    @Transactional
    public HabitLog checkIn(Integer habitId, Integer completedCount, LocalDate date, String username) {
        Habit habit = habitRepository.findByIdAndUser_Username(habitId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));

        LocalDate today = LocalDate.now(ZoneId.of(habit.getUser().getTimeZone()));
        if (completedCount == null || completedCount < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed amount must be at least 1");
        }
        if (date == null || !date.equals(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-ins can only be recorded for today");
        }
        if (!habit.isScheduledOn(date)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This habit is not scheduled for the selected date");
        }

        HabitLog log = logRepository.findByHabitAndCheckInDate(habit, date).orElseGet(HabitLog::new);
        boolean isUpdate = log.getId() != null;
        log.setHabit(habit);
        log.setCheckInDate(date);
        log.setCompletedCount(completedCount);
        int goal = habit.getGoalCount() == null ? 1 : habit.getGoalCount();
        LogStatus status = (completedCount >= goal) ? LogStatus.SUCCESS : LogStatus.FAIL;
        log.setStatus(status);
        HabitLog saved = logRepository.save(log);

        User user = habit.getUser();
        historyService.logAction(user, isUpdate ? "UPDATED_CHECK_IN" : "CHECKED_IN",
                (isUpdate ? "Updated check-in for '" : "Checked in to '") + habit.getTitle() + "' with " + completedCount + "/" + goal);

        return saved;
    }

    public List<HabitLog> getLogsByUserAndDateRange(User user, LocalDate start, LocalDate end) {
        return logRepository.findByHabit_UserAndCheckInDateBetween(user, start, end);
    }
}
