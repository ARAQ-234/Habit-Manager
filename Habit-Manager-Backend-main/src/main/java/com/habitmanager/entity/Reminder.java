package com.habitmanager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.LocalDate;

@Entity
@Table(name = "reminders")
public class Reminder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    private LocalTime reminderTime;
    private String daysOfWeek; // e.g., "MONDAY" or empty for daily
    private Boolean isActive = true;
    private LocalDateTime createdAt;
    private LocalDateTime lastSentAt;
    private LocalDate lastResponseDate;
    @Column(length = 16)
    private String lastResponseStatus;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Habit getHabit() { return habit; }
    public void setHabit(Habit habit) { this.habit = habit; }
    public LocalTime getReminderTime() { return reminderTime; }
    public void setReminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; }
    public String getDaysOfWeek() { return daysOfWeek; }
    public void setDaysOfWeek(String daysOfWeek) { this.daysOfWeek = daysOfWeek; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastSentAt() { return lastSentAt; }
    public void setLastSentAt(LocalDateTime lastSentAt) { this.lastSentAt = lastSentAt; }
    public LocalDate getLastResponseDate() { return lastResponseDate; }
    public void setLastResponseDate(LocalDate lastResponseDate) { this.lastResponseDate = lastResponseDate; }
    public String getLastResponseStatus() { return lastResponseStatus; }
    public void setLastResponseStatus(String lastResponseStatus) { this.lastResponseStatus = lastResponseStatus; }
}
