package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.PressureScoreHistory;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PressureScoreHistoryRepository extends JpaRepository<PressureScoreHistory, Long> {
    
    /**
     * Find pressure score history entries for a specific user and project
     * @param user The user
     * @param project The project
     * @return List of pressure score history entries sorted by recorded time (most recent first)
     */
    List<PressureScoreHistory> findByUserAndProjectOrderByRecordedAtDesc(User user, Project project);
    
    /**
     * Find pressure score history entries for a specific user and project with limit
     * @param user The user
     * @param project The project
     * @param limit Maximum number of entries to retrieve
     * @return Limited list of pressure score history entries sorted by recorded time (most recent first)
     */
    @Query("SELECT psh FROM PressureScoreHistory psh WHERE psh.user = :user AND psh.project = :project ORDER BY psh.recordedAt DESC")
    List<PressureScoreHistory> findLatestByUserAndProject(
        @Param("user") User user,
        @Param("project") Project project
    );

    /**
     * Find pressure score history entries for a specific user and project between dates
     * @param user The user
     * @param project The project
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of matching pressure score history entries
     */
    List<PressureScoreHistory> findByUserAndProjectAndRecordedAtBetweenOrderByRecordedAtAsc(
        User user, Project project, LocalDateTime startDate, LocalDateTime endDate);
}