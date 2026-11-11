package com.habitmanager.dao;

import java.time.LocalDate;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class HabitDAO {
    @NotBlank @Size(max = 120)
    private String title;
    @Size(max = 2000)
    private String description;
    @NotBlank @Size(max = 20) @Pattern(regexp = "^(DAILY|WEEKLY|MONTHLY)$")
    private String frequency;
    @NotNull @Min(1)
    private Integer goalCount;
    @Size(max = 100)
    private String unit;
    @Size(max = 255)
    private String scheduledValues;
    private LocalDate endDate;
    @Min(1)
    private Integer categoryId;

    // getters and setters
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
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
}
