package com.habitmanager.repository;

import com.habitmanager.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    void deleteByHabit_Id(Integer habitId);
    List<Reminder> findByIsActiveTrueAndReminderTimeBetween(LocalTime start, LocalTime end);
    List<Reminder> findByIsActiveTrue();
    List<Reminder> findByHabit_User_UsernameAndIsActiveTrue(String username);
    List<Reminder> findByHabit_User_Username(String username);
    List<Reminder> findByHabit_User_UsernameAndIsActiveTrueAndReminderTimeBetween(
            String username, LocalTime start, LocalTime end);
    Optional<Reminder> findByIdAndHabit_User_Username(Long id, String username);
}
