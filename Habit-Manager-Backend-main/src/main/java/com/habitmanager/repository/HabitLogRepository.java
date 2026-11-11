package com.habitmanager.repository;

import com.habitmanager.entity.Habit;
import com.habitmanager.entity.HabitLog;
import com.habitmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitLogRepository extends JpaRepository<HabitLog, Integer> {
    void deleteByHabit_Id(Integer habitId);

    // Find log for a specific habit and date (used for duplicate check)
    Optional<HabitLog> findByHabitAndCheckInDate(Habit habit, LocalDate date);
    Optional<HabitLog> findByHabit_IdAndHabit_User_UsernameAndCheckInDate(Integer habitId, String username, LocalDate date);

    // Find all logs for a habit ordered by date descending (used for streak calculation)
    List<HabitLog> findByHabitOrderByCheckInDateDesc(Habit habit);

    // Find logs for a habit within a date range (used for analytics)
    List<HabitLog> findByHabitAndCheckInDateBetween(Habit habit, LocalDate start, LocalDate end);

    // Find logs for a user within a date range (used for calendar coloring)
    List<HabitLog> findByHabit_UserAndCheckInDateBetween(User user, LocalDate start, LocalDate end);
    List<HabitLog> findByHabit_UserAndCheckInDateBetweenOrderByCheckInDateAsc(User user, LocalDate start, LocalDate end);
    List<HabitLog> findByHabit_UserAndCheckInDateBetweenAndDeletedAtIsNullOrderByCheckInDateAsc(User user, LocalDate start, LocalDate end);
    List<HabitLog> findByHabit_User_UsernameOrderByCheckInDateDesc(String username);
}
