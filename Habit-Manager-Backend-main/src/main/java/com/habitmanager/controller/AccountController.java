package com.habitmanager.controller;

import com.habitmanager.dao.AccountSettingsRequest;
import com.habitmanager.dao.AccountSettingsResponse;
import com.habitmanager.dao.DeleteAccountRequest;
import com.habitmanager.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    @Autowired private AccountService accountService;

    @GetMapping("/settings")
    public ResponseEntity<AccountSettingsResponse> getSettings(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(accountService.getSettings(user.getUsername()));
    }

    @PutMapping("/settings")
    public ResponseEntity<AccountSettingsResponse> updateSettings(@Valid @RequestBody AccountSettingsRequest request,
                                                                   @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(accountService.updateSettings(user.getUsername(), request));
    }

    @GetMapping("/export")
    public ResponseEntity<Map<String, Object>> exportData(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(accountService.exportData(user.getUsername()));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(@Valid @RequestBody DeleteAccountRequest request,
                                               @AuthenticationPrincipal UserDetails user) {
        accountService.deleteAccount(user.getUsername(), request.getPassword());
        return ResponseEntity.noContent().build();
    }
}
