package com.habitmanager.repository;

import com.habitmanager.entity.ReminderRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ReminderRecordRepository extends JpaRepository<ReminderRecord, Long> {
    void deleteByHabit_Id(Integer habitId);
    List<ReminderRecord> findByStatusAndScheduledTimeLessThanEqual(String status, LocalDateTime now);
}
