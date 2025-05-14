package com.itss.projectmanagement.scheduler;

import com.itss.projectmanagement.service.IPressureScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PressureScoreScheduler {

    private final IPressureScoreService pressureScoreService;

    /**
     * Updates pressure scores for all users in all active projects daily at midnight.
     * This allows the system to recalculate Time Urgency Factors as days pass.
     */
    @Scheduled(cron = "0 0 0 * * ?", zone = "Asia/Ho_Chi_Minh")
    public void updateDailyPressureScores() {
        log.info("Scheduled task: Starting daily pressure score update");
        pressureScoreService.updateAllPressureScores();
        log.info("Scheduled task: Completed daily pressure score update");
    }
}