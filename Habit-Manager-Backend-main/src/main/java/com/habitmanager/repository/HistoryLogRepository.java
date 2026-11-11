package com.habitmanager.repository;

import com.habitmanager.entity.HistoryLog;
import com.habitmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.time.LocalDateTime;

public interface HistoryLogRepository extends JpaRepository<HistoryLog, Long> {
    List<HistoryLog> findByUserOrderByTimestampDesc(User user);
    List<HistoryLog> findByUserOrderByTimestampDescIdDesc(User user, Pageable pageable);
    void deleteByUser(User user);

    @Modifying
    @Query(value = "DELETE h FROM history_logs h JOIN (" +
            "SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id " +
            "ORDER BY `timestamp` DESC, id DESC) AS row_num FROM history_logs) ranked " +
            "WHERE row_num > 50) excess ON excess.id = h.id", nativeQuery = true)
    int deleteBeyondLatest50ForAllUsers();

    @Modifying
    @Query(value = "DELETE FROM history_logs WHERE `timestamp` < :cutoff", nativeQuery = true)
    int deleteOlderThan(@Param("cutoff") LocalDateTime cutoff);
}
