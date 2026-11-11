package com.habitmanager.dao;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank @Size(min = 3, max = 50)
    private String username;
    @NotBlank @Email @Size(max = 254)
    private String email;
    @NotBlank @Size(min = 5, max = 12)
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username == null ? null : username.trim(); }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email == null ? null : email.trim(); }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
