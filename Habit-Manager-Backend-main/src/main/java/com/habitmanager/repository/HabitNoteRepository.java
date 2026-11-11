package com.habitmanager.repository;

import com.habitmanager.entity.Habit;
import com.habitmanager.entity.HabitNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HabitNoteRepository extends JpaRepository<HabitNote, Integer> {
    void deleteByHabit_Id(Integer habitId);
    List<HabitNote> findByHabit(Habit habit);
}
