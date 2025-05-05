package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.PeerReviewFailure;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PeerReviewFailureRepository extends JpaRepository<PeerReviewFailure, Long> {
    
    /**
     * Find all failures for a specific user
     */
    List<PeerReviewFailure> findByUser(User user);
    
    /**
     * Find all failures in a specific project
     */
    List<PeerReviewFailure> findByProject(Project project);
    
    /**
     * Find all failures for a specific user in a specific project
     */
    List<PeerReviewFailure> findByUserAndProject(User user, Project project);
    
    /**
     * Find all failures from a specific week
     */
    List<PeerReviewFailure> findByReviewWeek(Integer reviewWeek);
    
    /**
     * Count the number of failures for a user in a project
     */
    Long countByUserAndProject(User user, Project project);
    
    /**
     * Count the number of failures for a user
     */
    Long countByUser(User user);
    
    /**
     * Find users with the most failures in a project
     */
    @Query("SELECT prf.user, COUNT(prf) as failureCount FROM PeerReviewFailure prf " +
           "WHERE prf.project = :project GROUP BY prf.user ORDER BY failureCount DESC")
    List<Object[]> findUsersWithMostFailuresByProject(@Param("project") Project project);
    
    /**
     * Find failures from the last week
     */
    @Query("SELECT prf FROM PeerReviewFailure prf WHERE prf.failureDate >= :startDate")
    List<PeerReviewFailure> findRecentFailures(@Param("startDate") LocalDateTime startDate);
}