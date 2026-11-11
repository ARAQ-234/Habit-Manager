package com.habitmanager.repository;

import com.habitmanager.entity.Habit;
import com.habitmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Integer> {
    List<Habit> findByUser(User user);
    List<Habit> findByUserAndArchived(User user, boolean archived);
    Optional<Habit> findByIdAndUser_Username(Integer id, String username);
}
