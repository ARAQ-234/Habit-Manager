package com.habitmanager.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "habit_schedules")
public class HabitSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    private String dayOfWeek;   // MON, TUE, WED, THU, FRI, SAT, SUN (null for DAILY/MONTHLY)
    private Integer dayOfMonth; // 1-31 (null for DAILY/WEEKLY)
    private LocalTime reminderTime; // optional, for notifications

    // Default no-arg constructor
    public HabitSchedule() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Habit getHabit() { return habit; }
    public void setHabit(Habit habit) { this.habit = habit; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public Integer getDayOfMonth() { return dayOfMonth; }
    public void setDayOfMonth(Integer dayOfMonth) { this.dayOfMonth = dayOfMonth; }
    public LocalTime getReminderTime() { return reminderTime; }
    public void setReminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; }
}