package com.habitmanager.scheduler;

import com.habitmanager.entity.Reminder;
import com.habitmanager.repository.ReminderRepository;
import com.habitmanager.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Arrays;
import java.util.Locale;

@Component
@EnableScheduling
public class ReminderSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(ReminderSchedulerService.class);

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private EmailService emailService;

    @Scheduled(fixedDelay = 60000)
    public void sendEmailReminders() {
        List<Reminder> reminders = reminderRepository.findByIsActiveTrue();

        for (Reminder reminder : reminders) {
            if (reminder.getHabit().isArchived()) continue;
            if (reminder.getReminderTime() == null) continue;
            ZoneId zone = ZoneId.of(reminder.getHabit().getUser().getTimeZone());
            LocalTime now = LocalTime.now(zone);
            LocalDate today = LocalDate.now(zone);
            if (reminder.getReminderTime().isBefore(now.minusMinutes(1)) || reminder.getReminderTime().isAfter(now.plusMinutes(1))) continue;
            // Check if habit is still active (endDate null or not passed)
            LocalDate endDate = reminder.getHabit().getEndDate();
            if (endDate != null && endDate.isBefore(today)) {
                logger.info("Skipping expired reminder id {}", reminder.getId());
                continue;
            }

            if (isTodayMatching(reminder, today)) {
                if (today.equals(reminder.getLastResponseDate())) continue;
                if (reminder.getLastSentAt() != null && reminder.getLastSentAt().toLocalDate().equals(today)) {
                    continue;
                }
                String email = reminder.getHabit().getUser().getEmail();
                String habitTitle = reminder.getHabit().getTitle();
                String scheduledTime = reminder.getReminderTime().toString();
                try {
                    if (emailService.sendReminderEmail(email, habitTitle, scheduledTime)) {
                        reminder.setLastSentAt(java.time.LocalDateTime.now(zone));
                        reminderRepository.save(reminder);
                    }
                } catch (Exception e) {
                    logger.error("Failed to send reminder for reminder id {}", reminder.getId(), e);
                }
            }
        }
    }

    private boolean isTodayMatching(Reminder reminder, LocalDate todayDate) {
        if (reminder.getDaysOfWeek() != null && !reminder.getDaysOfWeek().isBlank()) {
            String today = todayDate.getDayOfWeek().name();
            return Arrays.stream(reminder.getDaysOfWeek().split(","))
                    .map(String::trim).map(value -> value.toUpperCase(Locale.ROOT)).anyMatch(today::equals);
        }
        String freq = reminder.getHabit().getFrequency();
        String scheduledValues = reminder.getHabit().getScheduledValues();
        if (scheduledValues == null || scheduledValues.isEmpty()) {
            return "DAILY".equalsIgnoreCase(freq);
        }
        if ("DAILY".equalsIgnoreCase(freq)) return true;
        if ("WEEKLY".equalsIgnoreCase(freq)) {
            String today = todayDate.getDayOfWeek().toString().substring(0,3);
            return Arrays.stream(scheduledValues.split(","))
                    .map(String::trim).map(value -> value.toUpperCase(Locale.ROOT)).anyMatch(today::equals);
        }
        if ("MONTHLY".equalsIgnoreCase(freq)) {
            int dayOfMonth = todayDate.getDayOfMonth();
            return Arrays.stream(scheduledValues.split(","))
                    .map(String::trim).anyMatch(value -> Integer.toString(dayOfMonth).equals(value));
        }
        return false;
    }
}
