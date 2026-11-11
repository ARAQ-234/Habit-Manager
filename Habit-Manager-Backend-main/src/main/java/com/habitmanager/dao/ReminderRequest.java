package com.habitmanager.dao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class ReminderRequest {
    @NotNull
    private Integer habitId;
    @NotBlank
    @Pattern(regexp = "^(?:[01]\\d|2[0-3]):[0-5]\\d$")
    private String reminderTime;
    private String daysOfWeek;
    private Boolean active = true;

    public Integer getHabitId() { return habitId; }
    public void setHabitId(Integer habitId) { this.habitId = habitId; }
    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }
    public String getDaysOfWeek() { return daysOfWeek; }
    public void setDaysOfWeek(String daysOfWeek) { this.daysOfWeek = daysOfWeek; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
