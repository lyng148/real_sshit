package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.contribution.ContributionScoreResponse;
import com.itss.projectmanagement.entity.ContributionScore;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;

import java.util.List;

public interface ContributionScoreService {
    /**
     * Calculate contribution score for a user in a project
     * @param user The user
     * @param project The project
     * @return The calculated contribution score
     */
    ContributionScore calculateScore(User user, Project project);
    
    /**
     * Calculate contribution scores for all users in a project
     * @param project The project
     * @return List of calculated contribution scores
     */
    List<ContributionScore> calculateScoresForProject(Project project);
    
    /**
     * Get contribution score for a specific user in a project
     * @param user The user
     * @param project The project
     * @return The contribution score response DTO
     */
    ContributionScoreResponse getScoreByUserAndProject(User user, Project project);
    
    /**
     * Get contribution scores for all users in a project
     * Always recalculates the latest scores
     * @param project The project
     * @return List of contribution score response DTOs
     */
    List<ContributionScoreResponse> getScoresByProject(Project project);
    
    /**
     * Adjust a user's contribution score (by instructor)
     * @param id The contribution score ID
     * @param adjustedScore The adjusted score
     * @param adjustmentReason The reason for adjustment
     * @return The updated contribution score response DTO
     */
    ContributionScoreResponse adjustScore(Long id, Double adjustedScore, String adjustmentReason);
    
    /**
     * Finalize contribution scores for a project
     * @param projectId The project ID
     * @return List of finalized contribution score response DTOs
     */
    List<ContributionScoreResponse> finalizeScores(Long projectId);
}