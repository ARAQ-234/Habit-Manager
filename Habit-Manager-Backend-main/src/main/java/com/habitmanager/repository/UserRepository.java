package com.habitmanager.repository;

import com.habitmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);   // Email နဲ့ရှာဖို့ ထည့်ထားတယ်
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}