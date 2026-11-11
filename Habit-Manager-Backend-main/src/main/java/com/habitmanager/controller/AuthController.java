package com.habitmanager.controller;

import com.habitmanager.dao.JwtResponse;
import com.habitmanager.dao.LoginRequest;
import com.habitmanager.dao.MessageResponse;
import com.habitmanager.dao.RegisterRequest;
import com.habitmanager.dao.ForgotPasswordRequest;
import com.habitmanager.dao.ResetPasswordRequest;
import com.habitmanager.entity.User;
import com.habitmanager.security.JwtUtils;
import com.habitmanager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@jakarta.validation.Valid @RequestBody RegisterRequest request) {
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Username is already taken!"));
        }
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is already in use!"));
        }
        userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@jakarta.validation.Valid @RequestBody ForgotPasswordRequest request) {
        userService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(new MessageResponse("If an account exists for that email, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@jakarta.validation.Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok(new MessageResponse("Password updated. You can sign in with your new password."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@jakarta.validation.Valid @RequestBody LoginRequest request) {
        // request.getUsername() ထဲမှာ email ထည့်ရန်
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (org.springframework.security.authentication.BadCredentialsException exception) {
            return ResponseEntity.status(401).body(new MessageResponse("Invalid email or password"));
        }
        User user = userService.findByEmail(request.getUsername());
        if (user == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Invalid email or password"));
        }
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication.getName()); // authentication.getName() = username

        return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), user.getTimeZone()));
    }
}
