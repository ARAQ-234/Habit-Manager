package com.habitmanager.dao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AccountSettingsRequest {
    @NotBlank @Size(max = 64)
    private String timeZone;
    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }
}
