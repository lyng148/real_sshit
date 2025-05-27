package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.PeerReview;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PeerReviewRepository extends JpaRepository<PeerReview, Long> {

    List<PeerReview> findByReviewerAndProject(User reviewer, Project project);
    
    List<PeerReview> findByRevieweeAndProject(User reviewee, Project project);
    
    List<PeerReview> findByProject(Project project);
    
    boolean existsByReviewerAndRevieweeAndProjectAndReviewWeek(
            User reviewer, User reviewee, Project project, Integer reviewWeek);
    
    boolean existsByReviewerAndIsCompletedFalse(User reviewer);
    
    /**
     * Find incomplete peer reviews assigned more than 24 hours ago that haven't been notified yet
     */
    List<PeerReview> findByIsCompletedFalseAndCheckNotifiedFalseAndAssignedAtBefore(LocalDateTime cutoffTime);

    @Query("SELECT AVG(pr.score) FROM PeerReview pr WHERE pr.reviewee = :reviewee AND pr.project = :project AND pr.isValid = true AND pr.isCompleted = true")
    Double findAverageScoreByRevieweeAndProject(@Param("reviewee") User reviewee, @Param("project") Project project);

    @Query("SELECT COUNT(pr) FROM PeerReview pr WHERE pr.reviewer = :user AND pr.project = :project AND pr.isCompleted = true")
    Long countCompletedReviewsByReviewerAndProject(@Param("user") User user, @Param("project") Project project);
    
    @Query("SELECT COUNT(DISTINCT u) FROM Group g JOIN g.members u WHERE g.project = :project AND u.id != :userId")
    Long countTeamMembersToReview(@Param("project") Project project, @Param("userId") Long userId);
    
    @Query("SELECT pr.reviewee FROM PeerReview pr WHERE pr.reviewer.id = :reviewerId AND pr.project = :project AND pr.isCompleted = false AND pr.isValid = true")
    List<User> findMembersNotReviewedByReviewer(@Param("project") Project project, @Param("reviewerId") Long reviewerId);
    
    /**
     * Find incomplete and valid peer reviews by reviewer
     */
    List<PeerReview> findByReviewerAndIsCompletedFalseAndIsValidTrue(User reviewer);
    
    /**
     * Find incomplete reviews by a reviewer that were assigned before a specific time
     */
    List<PeerReview> findByReviewerAndIsCompletedFalseAndAssignedAtBefore(User reviewer, LocalDateTime cutoffTime);
    
    /**
     * Update peer reviews that are over a day old and haven't been completed
     * Sets their isValid field to false
     * @param cutoffTime The time threshold (typically now minus 24 hours)
     * @return Number of records updated
     */
    @Modifying
    @Transactional
    @Query("UPDATE PeerReview pr SET pr.isValid = false WHERE pr.isCompleted = false AND pr.isValid = true AND pr.assignedAt < :cutoffTime")
    int invalidateOverduePeerReviews(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Đếm số lần không hoàn thành đánh giá chéo (invalid) của người dùng trong một dự án
     */
    @Query("SELECT COUNT(pr) FROM PeerReview pr WHERE pr.reviewer = :user AND pr.project = :project AND pr.isValid = false")
    Long countInvalidReviewsByUserAndProject(@Param("user") User user, @Param("project") Project project);
    
    /**
     * Tìm người dùng có nhiều đánh giá không hợp lệ nhất trong một dự án
     */
    @Query("SELECT pr.reviewer, COUNT(pr) as failureCount FROM PeerReview pr " +
           "WHERE pr.project = :project AND pr.isValid = false " +
           "GROUP BY pr.reviewer ORDER BY failureCount DESC")
    List<Object[]> findUsersWithMostInvalidReviewsByProject(@Param("project") Project project);
    
    /**
     * Tìm các đánh giá không hợp lệ trong khoảng thời gian
     */
    @Query("SELECT pr FROM PeerReview pr WHERE pr.isValid = false AND pr.updatedAt >= :startDate")
    List<PeerReview> findRecentInvalidReviews(@Param("startDate") LocalDateTime startDate);
    
    /**
     * Find average score across all reviews in a project
     */
    @Query("SELECT AVG(pr.score) FROM PeerReview pr WHERE pr.project = :project AND pr.isValid = true AND pr.isCompleted = true")
    Double findAverageScoreByProject(@Param("project") Project project);
    
    /**
     * Count total reviews for a project
     */
    long countByProject(Project project);
      
    /**
     * Count reviews by project and completion status
     */
    long countByProjectAndIsCompleted(Project project, boolean isCompleted);
    
    /**
     * Check if peer review has been triggered for a group in the last week
     */
    @Query("SELECT COUNT(pr) > 0 FROM PeerReview pr " +
           "JOIN User u ON pr.reviewer = u " +
           "JOIN Group g ON u MEMBER OF g.members OR g.leader = u " +
           "WHERE g.id = :groupId AND pr.assignedAt >= :oneWeekAgo")
    boolean hasGroupTriggeredPeerReviewInLastWeek(@Param("groupId") Long groupId, @Param("oneWeekAgo") LocalDateTime oneWeekAgo);
}