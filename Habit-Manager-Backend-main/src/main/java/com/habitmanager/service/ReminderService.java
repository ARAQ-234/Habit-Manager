package com.habitmanager.service;

import com.habitmanager.entity.Reminder;
import com.habitmanager.entity.User;
import com.habitmanager.entity.Habit;
import com.habitmanager.dao.ReminderRequest;
import com.habitmanager.dao.ReminderResponse;
import com.habitmanager.repository.ReminderRepository;
import com.habitmanager.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalTime;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.List;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReminderService {
    @Autowired private ReminderRepository reminderRepository;
    @Autowired private HistoryService historyService;
    @Autowired private UserService userService;
    @Autowired private HabitRepository habitRepository;

    public List<ReminderResponse> getUserReminders(String username) {
        return reminderRepository.findByHabit_User_Username(username).stream().map(ReminderResponse::from).toList();
    }

    public void deleteAllForUser(String username) {
        reminderRepository.deleteAll(reminderRepository.findByHabit_User_Username(username));
    }

    @Transactional
    public ReminderResponse createReminder(ReminderRequest request, String username) {
        Habit habit = habitRepository.findByIdAndUser_Username(request.getHabitId(), username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));
        Reminder reminder = new Reminder();
        reminder.setHabit(habit);
        applyRequest(reminder, request);
        return ReminderResponse.from(reminderRepository.save(reminder));
    }

    @Transactional
    public ReminderResponse updateReminder(Long id, ReminderRequest request, String username) {
        Reminder reminder = reminderRepository.findByIdAndHabit_User_Username(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder not found"));
        Habit habit = habitRepository.findByIdAndUser_Username(request.getHabitId(), username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));
        reminder.setHabit(habit);
        applyRequest(reminder, request);
        return ReminderResponse.from(reminderRepository.save(reminder));
    }

    @Transactional
    public void deleteReminder(Long id, String username) {
        Reminder reminder = reminderRepository.findByIdAndHabit_User_Username(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder not found"));
        reminderRepository.delete(reminder);
    }

    private void applyRequest(Reminder reminder, ReminderRequest request) {
        reminder.setReminderTime(LocalTime.parse(request.getReminderTime()));
        reminder.setDaysOfWeek(normalizeDays(request.getDaysOfWeek()));
        reminder.setIsActive(request.getActive() == null || request.getActive());
        reminder.setLastResponseDate(null);
        reminder.setLastResponseStatus(null);
    }

    private String normalizeDays(String days) {
        if (days == null || days.isBlank()) return "";
        Set<String> selected = Arrays.stream(days.split(","))
                .map(value -> value.trim().toUpperCase(Locale.ROOT)).filter(value -> !value.isEmpty())
                .collect(Collectors.toSet());
        Set<String> allowed = Set.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY");
        if (selected.isEmpty() || !allowed.containsAll(selected)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose valid reminder days");
        }
        return String.join(",", selected);
    }

    public List<Reminder> getPendingReminders(String username) {
        return reminderRepository.findByHabit_User_UsernameAndIsActiveTrue(username).stream()
                .filter(reminder -> !reminder.getHabit().isArchived())
                .filter(reminder -> {
                    if (reminder.getReminderTime() == null) return false;
                    ZoneId zone = ZoneId.of(reminder.getHabit().getUser().getTimeZone());
                    return isWithinReminderWindow(reminder.getReminderTime(), LocalTime.now(zone));
                })
                .filter(this::isScheduledToday)
                .filter(reminder -> !LocalDate.now(ZoneId.of(reminder.getHabit().getUser().getTimeZone())).equals(reminder.getLastResponseDate())).toList();
    }

    private boolean isWithinReminderWindow(LocalTime reminderTime, LocalTime now) {
        return !reminderTime.isBefore(now.minusMinutes(1)) && !reminderTime.isAfter(now.plusMinutes(1));
    }

    private boolean isScheduledToday(Reminder reminder) {
        String days = reminder.getDaysOfWeek();
        LocalDate date = LocalDate.now(ZoneId.of(reminder.getHabit().getUser().getTimeZone()));
        if (days == null || days.isBlank()) return reminder.getHabit().isScheduledOn(date);
        String today = date.getDayOfWeek().name();
        return Arrays.stream(days.split(",")).map(String::trim).anyMatch(today::equalsIgnoreCase);
    }

    @Transactional
    public void respondToReminder(Long id, String response, String username) {
        Reminder reminder = reminderRepository.findByIdAndHabit_User_Username(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder not found"));
        if (!"SKIP".equalsIgnoreCase(response) && !"ACCEPT".equalsIgnoreCase(response)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Response must be ACCEPT or SKIP");
        }
        reminder.setLastResponseDate(LocalDate.now(ZoneId.of(reminder.getHabit().getUser().getTimeZone())));
        reminder.setLastResponseStatus(response.toUpperCase(java.util.Locale.ROOT));
        reminderRepository.save(reminder);

        User user = userService.findByUsername(username);
        String action = "SKIP".equalsIgnoreCase(response) ? "SKIPPED" : "ACCEPTED";
        historyService.logAction(user, action,
                "Reminder for '" + reminder.getHabit().getTitle() + "' was " + action.toLowerCase());
    }
}
