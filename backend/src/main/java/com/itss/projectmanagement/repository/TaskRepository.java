package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByGroupAndAssignee(Group group, User assignee);
    
    List<Task> findByAssignee(User assignee);
    
    List<Task> findByGroup(Group group);
    
    List<Task> findByAssigneeAndStatus(User assignee, TaskStatus status);
    
    List<Task> findByGroupAndStatus(Group group, TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.assignee = :assignee AND t.group.project = :project AND t.status = :status")
    List<Task> findByAssigneeAndGroupProjectAndStatus(
            @Param("assignee") User assignee, 
            @Param("project") Project project, 
            @Param("status") TaskStatus status);
    @Query("SELECT t FROM Task t WHERE t.assignee = :assignee AND t.group.project = :project AND t.status != :status")
    List<Task> findByAssigneeAndGroupProjectAndStatusNot(
            @Param("assignee") User assignee,
            @Param("project") Project project,
            @Param("status") TaskStatus status
    );
    
    @Query("SELECT t FROM Task t WHERE t.assignee = :assignee AND t.group.project = :project AND t.deadline < :currentDate AND t.status != :completedStatus")
    List<Task> findOverdueTasksByAssigneeAndProject(
            @Param("assignee") User assignee,
            @Param("project") Project project,
            @Param("currentDate") LocalDate currentDate,
            @Param("completedStatus") TaskStatus completedStatus);
    
    // Find tasks by project
    @Query("SELECT t FROM Task t WHERE t.group.project = :project")
    List<Task> findByProject(@Param("project") Project project);
    
    // Find tasks by project and date range
    @Query("SELECT t FROM Task t WHERE t.group.project = :project AND t.createdAt BETWEEN :startDate AND :endDate")
    List<Task> findByProjectAndCreatedAtBetween(
            @Param("project") Project project,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}