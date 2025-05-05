package com.itss.projectmanagement.service;

import com.itss.projectmanagement.entity.User;

import java.util.List;
import java.util.Map;

public interface FreeRiderDetectionService {
    
    /**
     * Detect free riders in a project based on contribution scores and peer reviews
     * @param projectId The ID of the project
     * @return List of users identified as potential free riders
     */
    List<User> detectFreeRiders(Long projectId);
    
    /**
     * Get a map of free rider risk scores for all users in a project
     * @param projectId The ID of the project
     * @return Map of user IDs to their free rider risk scores (0-1 scale, higher means higher risk)
     */
    Map<Long, Double> getFreeRiderRiskScores(Long projectId);
    
    /**
     * Calculate free rider risk score for a specific user in a project
     * @param userId The ID of the user
     * @param projectId The ID of the project
     * @return Risk score (0-1 scale, higher means higher risk)
     */
    Double calculateFreeRiderRiskScore(Long userId, Long projectId);
    
    /**
     * Generate report for team leaders about potential free riders
     * @param projectId The ID of the project
     * @return Summary report as a formatted string
     */
    String generateFreeRiderReport(Long projectId);
}