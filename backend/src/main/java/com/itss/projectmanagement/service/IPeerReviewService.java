package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.request.peer.PeerReviewRequest;
import com.itss.projectmanagement.dto.response.peer.PeerReviewResponse;
import com.itss.projectmanagement.dto.response.user.UserSummaryDTO;
import com.itss.projectmanagement.entity.Project;

import java.util.List;

public interface IPeerReviewService {
    
    /**
     * Submit a peer review
     * @param request The peer review request
     * @param reviewerId The ID of the user submitting the review
     * @return The created peer review response
     */
    PeerReviewResponse submitReview(PeerReviewRequest request, Long reviewerId);
    
    /**
     * Get all reviews submitted by a user for a project
     * @param reviewerId The ID of the reviewer
     * @param projectId The ID of the project
     * @return List of peer review responses
     */
    List<PeerReviewResponse> getReviewsByReviewer(Long reviewerId, Long projectId);
    
    /**
     * Get all reviews received by a user for a project
     * @param revieweeId The ID of the reviewee
     * @param projectId The ID of the project
     * @return List of peer review responses
     */
    List<PeerReviewResponse> getReviewsByReviewee(Long revieweeId, Long projectId);
    
    /**
     * Check if a user has completed all required peer reviews for a project
     * @param userId The ID of the user
     * @param projectId The ID of the project
     * @return True if all reviews are completed, false otherwise
     */
    boolean hasCompletedAllReviews(Long userId, Long projectId);
    
    /**
     * Check if a user has any pending peer reviews to complete across all projects
     * @param userId The ID of the user
     * @return True if the user has pending peer reviews, false otherwise
     */
    boolean hasPendingPeerReviews(Long userId);
      
    /**
     * Get list of team members that haven't been reviewed by a user
     * @param projectId The ID of the project
     * @param reviewerId The ID of the reviewer
     * @return List of users that need to be reviewed
     */
    List<UserSummaryDTO> getMembersToReview(Long projectId, Long reviewerId);
    
    /**
     * Get average peer review score for a user in a project
     * @param userId The ID of the user
     * @param projectId The ID of the project
     * @return The average peer review score
     */
    Double getAverageScore(Long userId, Long projectId);
    
    /**
     * Trigger weekly peer review process for all active projects
     */
    void triggerWeeklyPeerReview();
    
    /**
     * Trigger weekly peer review process for a specific project
     * @param project The project to trigger peer review for
     */
    void triggerWeeklyPeerReview(Project project);
    
    /**
     * Notify team leaders about members who haven't completed their reviews
     * @param projectId The ID of the project
     */
    void notifyIncompleteReviews(Long projectId);
    
    /**
     * Start peer review process for a group manually (triggered by group leader)
     * @param groupId The ID of the group
     * @param userId The ID of the user initiating the review process (must be group leader)
     */
    void startPeerReviewForGroup(Long groupId, Long userId);
    
    /**
     * Get average review score for an entire project
     * @param projectId The ID of the project
     * @return The average review score for the project
     */
    double getAverageReviewScore(Long projectId);
    
    /**
     * Get the completion rate of peer reviews for a project
     * @param projectId The ID of the project
     * @return The percentage of completed reviews (0-100)
     */
    int getReviewCompletionRate(Long projectId);
    
    /**
     * Get the correlation between peer review scores and task completion rate
     * @param projectId The ID of the project
     * @return A correlation coefficient between -1 and 1
     */
    double getCorrelationWithTaskCompletion(Long projectId);
}