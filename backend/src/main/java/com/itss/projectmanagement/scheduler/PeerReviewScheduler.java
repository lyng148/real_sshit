package com.itss.projectmanagement.scheduler;

import com.itss.projectmanagement.entity.PeerReview;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.repository.PeerReviewRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.service.PeerReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Scheduler for checking peer review completion status and notifying group leaders
 * about incomplete reviews after the 24-hour deadline.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PeerReviewScheduler {

    private final PeerReviewService peerReviewService;
    private final PeerReviewRepository peerReviewRepository;

    /**
     * Check for incomplete peer reviews that have passed their 24-hour deadline
     * This runs every hour to check for reviews that need notification
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at xx:00
    public void checkIncompleteReviews() {
        log.info("Running scheduled check for incomplete peer reviews");
        
        // Get current time
        LocalDateTime now = LocalDateTime.now();
        
        // Find incomplete reviews that were assigned more than 24 hours ago and have not been notified
        List<PeerReview> overdueReviews = peerReviewRepository.findByIsCompletedFalseAndCheckNotifiedFalseAndAssignedAtBefore(
                now.minusHours(24)
        );
        
        if (overdueReviews.isEmpty()) {
            log.info("No overdue peer reviews found that need notifications");
            return;
        }
        
        log.info("Found {} overdue peer reviews that need notifications", overdueReviews.size());
        
        // Mark overdue reviews as invalid since they weren't completed within 24 hours
        int invalidatedCount = 0;
        for (PeerReview review : overdueReviews) {
            if (review.getIsValid()) {
                review.setIsValid(false);
                invalidatedCount++;
            }
        }
        
        if (invalidatedCount > 0) {
            log.info("Marked {} overdue peer reviews as invalid (isValid=false)", invalidatedCount);
        }
        
        // Group reviews by project for efficient processing
        Map<Long, List<PeerReview>> reviewsByProject = overdueReviews.stream()
                .collect(Collectors.groupingBy(review -> review.getProject().getId()));
        
        // Process each project's overdue reviews
        for (Map.Entry<Long, List<PeerReview>> entry : reviewsByProject.entrySet()) {
            Long projectId = entry.getKey();
            List<PeerReview> projectReviews = entry.getValue();
            
            try {
                log.info("Processing {} overdue peer reviews for project ID: {}", 
                        projectReviews.size(), projectId);
                
                // This will check incomplete reviews and notify group leaders
                peerReviewService.notifyIncompleteReviews(projectId);
                
                // Mark these reviews as notified, so we don't process them again
                projectReviews.forEach(review -> {
                    review.setCheckNotified(true);
                    peerReviewRepository.save(review);
                });
                
            } catch (Exception e) {
                log.error("Error checking incomplete reviews for project {}: {}", 
                        projectId, e.getMessage(), e);
            }
        }
        
        log.info("Completed scheduled check for incomplete peer reviews");
    }
    
    /**
     * Trigger weekly peer review process for all active projects
     * This runs every Friday at 5:00 PM
     */
    @Scheduled(cron = "0 0 17 * * 5") // Every Friday at 5:00 PM
    public void triggerWeeklyPeerReview() {
        log.info("Triggering weekly peer review process");
        
        try {
            peerReviewService.triggerWeeklyPeerReview();
        } catch (Exception e) {
            log.error("Error triggering weekly peer review: {}", e.getMessage(), e);
        }
        
        log.info("Completed triggering weekly peer review process");
    }
}