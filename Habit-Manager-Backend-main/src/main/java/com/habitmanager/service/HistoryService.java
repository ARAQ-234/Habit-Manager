package com.habitmanager.service;

import com.habitmanager.entity.HistoryLog;
import com.habitmanager.entity.User;
import com.habitmanager.repository.HistoryLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class HistoryService {
    @Autowired
    private HistoryLogRepository historyLogRepository;

    @Transactional
    public void logAction(User user, String action, String details) {
        HistoryLog log = new HistoryLog();
        log.setUser(user);
        log.setAction(action);
        log.setDetails(details);
        historyLogRepository.save(log);
        List<HistoryLog> recent = historyLogRepository.findByUserOrderByTimestampDescIdDesc(user, PageRequest.of(0, 51));
        if (recent.size() > 50) historyLogRepository.deleteAllInBatch(recent.subList(50, recent.size()));
    }

    public List<HistoryLog> getUserHistory(User user) {
        return historyLogRepository.findByUserOrderByTimestampDescIdDesc(user, PageRequest.of(0, 50));
    }
}
