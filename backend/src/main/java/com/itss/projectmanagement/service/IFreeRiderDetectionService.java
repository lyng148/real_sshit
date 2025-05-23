package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.freerider.FreeRiderCaseDTO;
import com.itss.projectmanagement.dto.response.user.UserDTO;
import com.itss.projectmanagement.entity.FreeRiderCase;
import com.itss.projectmanagement.entity.User;

import java.util.List;
import java.util.Map;

public interface IFreeRiderDetectionService {
      
    /**
     * Detect free riders in a project based on contribution scores and peer reviews
     * This method will also send notifications to instructors and project leaders
     * @param projectId The ID of the project
     * @return List of user DTOs identified as potential free riders
    */
    List<UserDTO> detectFreeRiders(Long projectId);
    
    /**
     * Detect free riders in a project without sending notifications
     * This method is useful for UI/dashboard views when notifications aren't needed
     * @param projectId The ID of the project
     * @return List of user DTOs identified as potential free riders
    */
    List<UserDTO> detectFreeRidersWithoutNotification(Long projectId);
    
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

    /**
     * Get detailed evidence for a specific free rider
     * @param userId The ID of the user
     * @param projectId The ID of the project
     * @return Map with evidence data
    */
    Map<String, Object> getFreeRiderEvidence(Long userId, Long projectId);
    
    /**
     * Get free rider evidence data for all members in a group
     * @param projectId The ID of the project
     * @param groupId The ID of the group (optional, if null returns data for all groups)
     * @return Map with group evidence data
     */
    Map<String, Object> getGroupFreeRiderEvidence(Long projectId, Long groupId);
      
    /**
     * Get all free rider cases for a project
     * @param projectId The ID of the project
     * @return List of free rider cases DTOs
     */
    List<FreeRiderCaseDTO> getFreeRiderCases(Long projectId);
    
    /**
     * Create a new free rider case
     * @param userId The ID of the user to mark as free rider
     * @param projectId The ID of the project
     * @return The created case DTO
     */
    FreeRiderCaseDTO createFreeRiderCase(Long userId, Long projectId);
    
    /**
     * Resolve a free rider case
     * @param caseId The ID of the case
     * @param resolution The resolution method (warning, reassignment, penalty, other)
     * @param notes Additional notes about resolution
     * @return The updated case DTO
     */
    FreeRiderCaseDTO resolveFreeRiderCase(Long caseId, String resolution, String notes);
}