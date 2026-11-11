package com.habitmanager.service;

import com.habitmanager.repository.HistoryLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class HistoryRetentionService {
    private static final Logger logger = LoggerFactory.getLogger(HistoryRetentionService.class);
    private final HistoryLogRepository historyLogRepository;

    public HistoryRetentionService(HistoryLogRepository historyLogRepository) {
        this.historyLogRepository = historyLogRepository;
    }

    // Run hourly so old activity is removed gradually without a large cleanup at startup.
    @Scheduled(fixedDelayString = "${app.history.cleanup-interval-ms:3600000}", initialDelayString = "${app.history.cleanup-initial-delay-ms:30000}")
    @Transactional
    public void purgeExpiredHistory() {
        int expired = historyLogRepository.deleteOlderThan(LocalDateTime.now().minusDays(3));
        int overLimit = historyLogRepository.deleteBeyondLatest50ForAllUsers();
        if (expired > 0 || overLimit > 0) {
            logger.info("History retention removed {} entries older than 3 days and {} entries beyond the per-user limit of 50", expired, overLimit);
        }
    }
}
