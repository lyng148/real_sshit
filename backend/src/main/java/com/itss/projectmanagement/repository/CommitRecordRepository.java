package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.CommitRecord;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommitRecordRepository extends JpaRepository<CommitRecord, Long> {
    Optional<CommitRecord> findByCommitId(String commitId);
    
    List<CommitRecord> findByGroup(Group group);
    
    List<CommitRecord> findByTask(Task task);
    
    List<CommitRecord> findByGroupAndTimestampBetween(Group group, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT cr FROM CommitRecord cr WHERE cr.group.project.id = :projectId")
    List<CommitRecord> findByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(cr) FROM CommitRecord cr WHERE cr.group.project.id = :projectId AND cr.authorEmail = :email AND cr.valid = true")
    long countByProjectIdAndAuthorEmailAndValidTrue(@Param("projectId") Long projectId, @Param("email") String email);

    List<CommitRecord> findByGroupAndValidAndTimestampAfter(Group group, boolean isValid, LocalDateTime timestamp);

    List<CommitRecord> findByGroupAndValid(Group group, boolean isValid);

    @Query("SELECT COUNT(cr) FROM CommitRecord cr WHERE cr.group.project.id = :projectId AND cr.timestamp BETWEEN :startDate AND :endDate")
    int countByProjectIdAndTimestampBetween(
            @Param("projectId") Long projectId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Optimized batch query to calculate code contribution statistics
     * Replaces N queries with single aggregate query
     */
    @Query("""
           SELECT\s
           COALESCE(SUM(CASE WHEN cr.additions IS NOT NULL THEN LEAST(cr.additions, :maxCap) ELSE 0 END), 0) as totalAdditions,\s
           COALESCE(SUM(CASE WHEN cr.deletions IS NOT NULL THEN LEAST(cr.deletions, :maxCap) ELSE 0 END), 0) as totalDeletions\s
           FROM CommitRecord cr\s
           WHERE cr.task.id IN :taskIds\s
           AND cr.valid = true
           """)
    CodeContributionSummary calculateCodeContributionForTasks(
            @Param("taskIds") List<Long> taskIds,
            @Param("maxCap") int maxCap);

    /**
     * Interface for code contribution summary projection
     */
    interface CodeContributionSummary {
        Long getTotalAdditions();
        Long getTotalDeletions();
    }
}