package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.PeerReview;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
    
    @Query("SELECT AVG(pr.score) FROM PeerReview pr WHERE pr.reviewee = :reviewee AND pr.project = :project")
    Double findAverageScoreByRevieweeAndProject(@Param("reviewee") User reviewee, @Param("project") Project project);
    
    @Query("SELECT COUNT(pr) FROM PeerReview pr WHERE pr.reviewer = :user AND pr.project = :project AND pr.isCompleted = true")
    Long countCompletedReviewsByReviewerAndProject(@Param("user") User user, @Param("project") Project project);
    
    @Query("SELECT COUNT(DISTINCT u) FROM Group g JOIN g.members u WHERE g.project = :project AND u.id != :userId")
    Long countTeamMembersToReview(@Param("project") Project project, @Param("userId") Long userId);
    
    @Query("SELECT pr.reviewee FROM PeerReview pr WHERE pr.reviewer.id = :reviewerId AND pr.project = :project AND pr.isCompleted = false")
    List<User> findMembersNotReviewedByReviewer(@Param("project") Project project, @Param("reviewerId") Long reviewerId);
}