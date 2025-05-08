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
    
    List<CommitRecord> findByAuthorEmail(String authorEmail);
    
    List<CommitRecord> findByTask(Task task);
    
    List<CommitRecord> findByGroupAndTimestampBetween(Group group, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT cr FROM CommitRecord cr WHERE cr.group.project.id = :projectId")
    List<CommitRecord> findByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT cr FROM CommitRecord cr WHERE cr.group.id IN " +
           "(SELECT g.id FROM Group g JOIN g.members m WHERE m.email = :email) OR " +
           "cr.group.leader.email = :email")
    List<CommitRecord> findByGroupMemberEmail(@Param("email") String email);
    
    @Query("SELECT cr FROM CommitRecord cr WHERE cr.group.project.id = :projectId AND cr.authorEmail = :email")
    List<CommitRecord> findByProjectIdAndAuthorEmail(@Param("projectId") Long projectId, @Param("email") String email);
    
    long countByAuthorEmailAndIsValidTrue(String authorEmail);
    
    @Query("SELECT COUNT(cr) FROM CommitRecord cr WHERE cr.group.project.id = :projectId AND cr.authorEmail = :email AND cr.isValid = true")
    long countByProjectIdAndAuthorEmailAndIsValidTrue(@Param("projectId") Long projectId, @Param("email") String email);

    List<CommitRecord> findByGroupAndIsValidAndTimestampAfter(Group group, boolean isValid, LocalDateTime timestamp);

    List<CommitRecord> findByGroupAndIsValid(Group group, boolean isValid);

    @Query("SELECT COUNT(cr) FROM CommitRecord cr WHERE cr.group.project.id = :projectId AND cr.timestamp BETWEEN :startDate AND :endDate")
    int countByProjectIdAndTimestampBetween(
            @Param("projectId") Long projectId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}