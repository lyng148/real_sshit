package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.github.CommitRecordDTO;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;

import java.time.LocalDateTime;
import java.util.List;

public interface IGitHubService {
    /**
     * Fetches commits from a GitHub repository and processes them for a specific group
     * @param group The group containing the GitHub repository URL
     * @return Number of new commits processed
     */
    int fetchAndProcessCommits(Group group);
    
    /**
     * Fetches commits from GitHub repositories for all groups in a project
     * @param project The project
     * @return Total number of new commits processed
     */
    int fetchAndProcessCommitsForProject(Project project);

    /**
     * Get all commits for a specific project
     * @param project The project
     * @return List of CommitRecord DTOs
     */
    List<CommitRecordDTO> getCommitsByProject(Project project);
    
    /**
     * Get all invalid commits for a specific project
     * @param project The project
     * @return List of CommitRecord DTOs
     */
    List<CommitRecordDTO> getInvalidCommitsByProject(Project project);
    
    /**
     * Get all commits for a specific group
     * @param  groupId The group ID
     * @return List of CommitRecord DTOs
     */
    List<CommitRecordDTO> getCommitsByGroup(Long groupId);
    
    /**
     * Get all invalid commits for a specific group
     * @param group The group
     * @return List of CommitRecord DTOs
     */
    List<CommitRecordDTO> getInvalidCommitsByGroup(Group group);
    
    /**
     * Get all commits for a specific task
     * @param taskId The task ID
     * @return List of CommitRecord DTOs
     */
    List<CommitRecordDTO> getCommitsByTask(Long taskId);

    /**
     * Get commit count in a specific date range for a project
     * @param projectId The project ID
     * @param startDate Start date of the range
     * @param endDate End date of the range
     * @return Number of commits in the date range
     */
    int getCommitCountInDateRange(Long projectId, LocalDateTime startDate, LocalDateTime endDate);
}