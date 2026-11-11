package com.habitmanager.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "habits")
public class Habit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, length = 120)
    private String title;
    @Column(length = 2000)
    private String description;
    @Column(nullable = false, length = 20)
    private String frequency;   // DAILY, WEEKLY, MONTHLY
    private Integer goalCount = 1;
    private String unit;
    private String scheduledValues; // e.g., "MON,WED" or "1,15"
    private LocalDate endDate;      // termination date (nullable)
    @Column(name = "is_archived", nullable = false)
    private boolean archived = false;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // Getters and setters (all fields)
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public Integer getGoalCount() { return goalCount; }
    public void setGoalCount(Integer goalCount) { this.goalCount = goalCount; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getScheduledValues() { return scheduledValues; }
    public void setScheduledValues(String scheduledValues) { this.scheduledValues = scheduledValues; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public boolean isScheduledOn(LocalDate date) {
        if (archived || date == null || (endDate != null && date.isAfter(endDate))) return false;
        if ("DAILY".equalsIgnoreCase(frequency)) return true;
        if (scheduledValues == null || scheduledValues.isBlank()) return false;
        if ("WEEKLY".equalsIgnoreCase(frequency)) {
            String day = date.getDayOfWeek().name().substring(0, 3);
            return java.util.Arrays.stream(scheduledValues.split(","))
                    .map(String::trim).anyMatch(day::equalsIgnoreCase);
        }
        if ("MONTHLY".equalsIgnoreCase(frequency)) {
            return java.util.Arrays.stream(scheduledValues.split(","))
                    .map(String::trim).anyMatch(value -> value.equals(Integer.toString(date.getDayOfMonth())));
        }
        return false;
    }
}
