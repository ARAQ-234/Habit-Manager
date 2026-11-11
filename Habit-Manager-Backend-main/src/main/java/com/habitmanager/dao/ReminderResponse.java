package com.habitmanager.dao;

import com.habitmanager.entity.Reminder;
import java.time.LocalTime;

public record ReminderResponse(Long id, Integer habitId, String habitTitle, LocalTime reminderTime,
                               String daysOfWeek, boolean active) {
    public static ReminderResponse from(Reminder reminder) {
        return new ReminderResponse(reminder.getId(), reminder.getHabit().getId(), reminder.getHabit().getTitle(),
                reminder.getReminderTime(), reminder.getDaysOfWeek(), Boolean.TRUE.equals(reminder.getIsActive()));
    }
}
