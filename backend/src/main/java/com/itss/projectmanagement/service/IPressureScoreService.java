package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.pressure.PressureScoreResponse;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface IPressureScoreService {
    
    /**
     * Calculate Time Urgency Factor (TUF) for a task based on days remaining until deadline
     * 
     * @param daysRemaining Days remaining until deadline (negative if overdue)
     * @return The Time Urgency Factor value
     */
    double calculateTimeUrgencyFactor(long daysRemaining);
    
    /**
     * Calculate Task Pressure Score (TPS) for a specific task
     * TPS = Difficulty Weight × Time Urgency Factor
     * 
     * @param difficultyWeight The weight of the task difficulty
     * @param timeUrgencyFactor The time urgency factor
     * @return The Task Pressure Score
     */
    double calculateTaskPressureScore(int difficultyWeight, double timeUrgencyFactor);
    
    /**
     * Calculate Total Member Pressure Score (TMPS) for a user
     * TMPS = Sum of TPS for all incomplete tasks assigned to the user
     * 
     * @param userId The user ID
     * @return The Total Member Pressure Score
     */
    double calculateTotalMemberPressureScore(Long userId);
    
    /**
     * Evaluate the pressure status of a user based on their TMPS and project threshold
     * 
     * @param userId The user ID
     * @return The pressure score response with status information
     */
    PressureScoreResponse evaluatePressureStatus(Long userId);
    
    /**
     * Get pressure scores for all users in a project
     * 
     * @param projectId The project ID
     * @return List of pressure score responses for all users in the project
     */
    List<PressureScoreResponse> getProjectPressureScores(Long projectId);
    
    /**
     * Update pressure scores for all users in all active projects
     * Used by the daily scheduler
     */
    void updateAllPressureScores();
    
    /**
     * Update pressure scores for all users in a specific project
     * 
     * @param project The project
     */
    void updateProjectPressureScores(Project project);
    
    /**
     * Get pressure score response for a specific user
     * 
     * @param user The user
     * @param project The project (optional, can be null to calculate across all projects)
     * @return The pressure score response
     */
    PressureScoreResponse getPressureScoreForUser(User user, Project project);
    
    /**
     * Calculate pressure score for a specific user in a project
     * 
     * @param userId The user ID
     * @param projectId The project ID
     * @return The calculated pressure score (0-100)
     */
    int calculatePressureScore(Long userId, Long projectId);
    
    /**
     * Get pressure score history for a user in a project
     * 
     * @param userId The user ID
     * @param projectId The project ID
     * @return Map of timestamp to pressure score
     */
    Map<LocalDateTime, Integer> getPressureScoreHistory(Long userId, Long projectId);
}