package com.habitmanager.repository;

import com.habitmanager.entity.Habit;
import com.habitmanager.entity.HabitSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HabitScheduleRepository extends JpaRepository<HabitSchedule, Integer> {
    void deleteByHabit_Id(Integer habitId);
    List<HabitSchedule> findByHabit(Habit habit);
}
