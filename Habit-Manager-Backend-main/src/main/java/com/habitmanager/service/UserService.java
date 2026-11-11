package com.habitmanager.service;

import com.habitmanager.dao.RegisterRequest;
import com.habitmanager.entity.User;
import com.habitmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import com.habitmanager.entity.PasswordResetToken;
import com.habitmanager.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;
    @Autowired
    private EmailService emailService;
    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;
    private final SecureRandom secureRandom = new SecureRandom();

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username.trim());
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email.trim().toLowerCase(Locale.ROOT));
    }

    @Transactional
    public User registerUser(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase(Locale.ROOT));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return userRepository.save(user);
    }

    public void requestPasswordReset(String email) {
        User user = findByEmail(email);
        if (user == null) return;
        LocalDateTime recentCutoff = LocalDateTime.now().minusMinutes(1);
        if (resetTokenRepository.findFirstByUser_IdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId())
                .filter(existing -> existing.getCreatedAt().isAfter(recentCutoff)).isPresent()) return;
        byte[] rawToken = new byte[32];
        secureRandom.nextBytes(rawToken);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(rawToken);
        PasswordResetToken reset = new PasswordResetToken();
        reset.setUser(user);
        reset.setTokenHash(sha256(token));
        reset.setExpiresAt(LocalDateTime.now().plusMinutes(20));
        resetTokenRepository.save(reset);
        String link = frontendBaseUrl.replaceAll("/+$", "") + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), link);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken reset = resetTokenRepository.findByTokenHashAndUsedAtIsNull(sha256(token))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset link is invalid or expired"));
        if (!reset.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset link is invalid or expired");
        }
        User user = reset.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        reset.setUsedAt(LocalDateTime.now());
        resetTokenRepository.save(reset);
        resetTokenRepository.deleteByUser_IdAndIdNot(user.getId(), reset.getId());
    }

    private String sha256(String value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    // Username နဲ့ရှာတဲ့ method ကို ဆက်ထားပေမယ့် login အတွက် မသုံးတော့ဘူး
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    // Email နဲ့ရှာတဲ့ method (login အတွက် သုံးမယ်)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElse(null);
    }
}
