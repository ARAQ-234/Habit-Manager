package com.habitmanager.repository;

import com.habitmanager.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHashAndUsedAtIsNull(String tokenHash);
    void deleteByUser_IdAndIdNot(Integer userId, Long id);
    Optional<PasswordResetToken> findFirstByUser_IdAndUsedAtIsNullOrderByCreatedAtDesc(Integer userId);
    void deleteByUser_Id(Integer userId);
}
