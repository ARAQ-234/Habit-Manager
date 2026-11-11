package com.habitmanager.dao;

import java.time.LocalDate;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class LogDAO {
    @NotNull
    private Integer habitId;
    @NotNull @Min(1)
    private Integer completedCount;
    @NotNull
    private LocalDate date;

    public Integer getHabitId() { return habitId; }
    public void setHabitId(Integer habitId) { this.habitId = habitId; }
    public Integer getCompletedCount() { return completedCount; }
    public void setCompletedCount(Integer completedCount) { this.completedCount = completedCount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
