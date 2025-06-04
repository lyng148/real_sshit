package com.itss.projectmanagement.scheduler;

import com.itss.projectmanagement.service.impl.PasswordServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PasswordResetCleanupScheduler {
    
    private final PasswordServiceImpl passwordService;
    
    /**
     * Clean up expired password reset tokens every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired password reset tokens");
        try {
            passwordService.cleanupExpiredTokens();
        } catch (Exception e) {
            log.error("Error during cleanup: {}", e.getMessage(), e);
        }
    }
} 