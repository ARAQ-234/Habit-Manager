package com.habitmanager.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;

import java.util.Map;

/** Uses PBKDF2 for new passwords and continues to verify existing unprefixed BCrypt hashes. */
public class LegacyCompatiblePasswordEncoder implements PasswordEncoder {
    private final BCryptPasswordEncoder legacyBcrypt = new BCryptPasswordEncoder();
    private final DelegatingPasswordEncoder current = new DelegatingPasswordEncoder("pbkdf2", Map.of(
            "pbkdf2", Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8(),
            "bcrypt", legacyBcrypt
    ));

    @Override
    public String encode(CharSequence rawPassword) {
        return current.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword != null && encodedPassword.startsWith("{")) {
            return current.matches(rawPassword, encodedPassword);
        }
        return legacyBcrypt.matches(rawPassword, encodedPassword);
    }

    @Override
    public boolean upgradeEncoding(String encodedPassword) {
        return encodedPassword == null || !encodedPassword.startsWith("{pbkdf2}")
                || current.upgradeEncoding(encodedPassword);
    }
}
