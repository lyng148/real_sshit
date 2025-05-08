package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.github.CommitRecordDTO;
import com.itss.projectmanagement.entity.CommitRecord;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.repository.CommitRecordRepository;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.TaskRepository;
import com.itss.projectmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kohsuke.github.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubService {

    private final GitHub gitHub;
    private final CommitRecordRepository commitRecordRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final NotificationService notificationService;
    
    // Pattern to match TASK-ID in commit messages: [TASK-123]
    private static final Pattern TASK_ID_PATTERN = Pattern.compile("\\[TASK-(\\d+)\\]");

    /**
     * Fetches commits from a GitHub repository and processes them for a specific group
     * @param group The group containing the GitHub repository URL
     * @return Number of new commits processed
     */
    public int fetchAndProcessCommits(Group group) {
        if (group.getRepositoryUrl() == null || group.getRepositoryUrl().isEmpty()) {
            log.warn("Group {} has no GitHub repository URL configured", group.getId());
            return 0;
        }
        
        String repoName = extractRepoFullName(group.getRepositoryUrl());
        if (repoName == null) {
            log.error("Invalid GitHub repository URL for group {}: {}", group.getId(), group.getRepositoryUrl());
            return 0;
        }
        
        try {
            GHRepository repository = gitHub.getRepository(repoName);
            int newCommitCount = 0;
            
            // Get commits from the repository
            PagedIterable<GHCommit> commits = repository.listCommits();
            for (GHCommit commit : commits) {
                // Skip if we already processed this commit
                if (commitRecordRepository.findByCommitId(commit.getSHA1()).isPresent()) {
                    continue;
                }
                
                processCommit(commit, group);
                newCommitCount++;
            }
            
            log.info("Processed {} new commits for group {}", newCommitCount, group.getId());
            return newCommitCount;
        } catch (IOException e) {
            log.error("Error accessing GitHub repository for group {}: {}", group.getId(), e.getMessage());
            return 0;
        }
    }
    
    /**
     * Fetches commits from GitHub repositories for all groups in a project
     * @param project The project
     * @return Total number of new commits processed
     */
    public int fetchAndProcessCommitsForProject(Project project) {
        List<Group> groups = groupRepository.findByProject(project);
        int totalNewCommits = 0;
        
        for (Group group : groups) {
            totalNewCommits += fetchAndProcessCommits(group);
        }
        
        return totalNewCommits;
    }
    
    /**
     * Process a single GitHub commit
     * @param commit The GitHub commit
     * @param group The associated group
     */
    private void processCommit(GHCommit commit, Group group) throws IOException {
        GHCommit.ShortInfo info = commit.getCommitShortInfo();
        String message = info.getMessage();
        
        // Extract task ID from commit message
        String taskId = extractTaskId(message);
        boolean isValid = taskId != null;
        
        // Find the matching task if taskId is present
        Task task = null;
        if (isValid) {
            task = taskRepository.findById(Long.valueOf(taskId)).orElse(null);
            // Mark invalid if task doesn't exist
            if (task == null) {
                isValid = false;
            }
        }
        
        // Create commit record
        CommitRecord commitRecord = CommitRecord.builder()
                .commitId(commit.getSHA1())
                .message(message)
                .taskId(taskId)
                .authorName(info.getAuthor().getName())
                .authorEmail(info.getAuthor().getEmail())
                .timestamp(convertToLocalDateTime(info.getCommitDate()))
                .group(group)
                .task(task)
                .isValid(isValid)
                .build();
        
        commitRecordRepository.save(commitRecord);
        
        // Notify leader about invalid commits
        if (!isValid && task == null && taskId != null) {
            notifyLeaderAboutInvalidCommit(group, commitRecord);
        }
    }
    
    /**
     * Get all commits for a specific project
     * @param project The project
     * @return List of CommitRecord DTOs
     */
    public List<CommitRecordDTO> getCommitsByProject(Project project) {
        List<CommitRecord> commitRecords = commitRecordRepository.findByProjectId(project.getId());
        return convertToDto(commitRecords);
    }
    
    /**
     * Get all invalid commits for a specific project
     * @param project The project
     * @return List of CommitRecord DTOs
     */
    public List<CommitRecordDTO> getInvalidCommitsByProject(Project project) {
        List<CommitRecord> commitRecords = commitRecordRepository.findByProjectId(project.getId()).stream()
                .filter(commit -> !commit.isValid())
                .collect(Collectors.toList());
        return convertToDto(commitRecords);
    }
    
    /**
     * Get all commits for a specific group
     * @param group The group
     * @return List of CommitRecord DTOs
     */
    public List<CommitRecordDTO> getCommitsByGroup(Group group) {
        List<CommitRecord> commitRecords = commitRecordRepository.findByGroup(group);
        return convertToDto(commitRecords);
    }
    
    /**
     * Get all invalid commits for a specific group
     * @param group The group
     * @return List of CommitRecord DTOs
     */
    public List<CommitRecordDTO> getInvalidCommitsByGroup(Group group) {
        List<CommitRecord> commitRecords = commitRecordRepository.findByGroup(group).stream()
                .filter(commit -> !commit.isValid())
                .collect(Collectors.toList());
        return convertToDto(commitRecords);
    }
    
    /**
     * Convert CommitRecord entities to DTOs
     * @param commitRecords List of CommitRecord entities
     * @return List of CommitRecord DTOs
     */
    private List<CommitRecordDTO> convertToDto(List<CommitRecord> commitRecords) {
        return commitRecords.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert a single CommitRecord entity to DTO
     * @param commitRecord CommitRecord entity
     * @return CommitRecord DTO
     */
    private CommitRecordDTO convertToDto(CommitRecord commitRecord) {
        CommitRecordDTO dto = new CommitRecordDTO();
        dto.setId(commitRecord.getId());
        dto.setCommitId(commitRecord.getCommitId());
        dto.setMessage(commitRecord.getMessage());
        dto.setTaskId(commitRecord.getTaskId());
        dto.setAuthorName(commitRecord.getAuthorName());
        dto.setAuthorEmail(commitRecord.getAuthorEmail());
        dto.setTimestamp(commitRecord.getTimestamp());
        dto.setValid(commitRecord.isValid());
        dto.setCreatedAt(commitRecord.getCreatedAt());
        
        // Set user ID and name if we can find a matching user by email
        userRepository.findByEmail(commitRecord.getAuthorEmail()).ifPresent(user -> {
            dto.setUserId(user.getId());
            dto.setUsername(user.getUsername());
        });
        
        // Set project information from group
        if (commitRecord.getGroup() != null && commitRecord.getGroup().getProject() != null) {
            Project project = commitRecord.getGroup().getProject();
            dto.setProjectId(project.getId());
            dto.setProjectName(project.getName());
            
            // Set group information
            dto.setGroupId(commitRecord.getGroup().getId());
            dto.setGroupName(commitRecord.getGroup().getName());
        }
        
        if (commitRecord.getTask() != null) {
            dto.setTaskIdLong(commitRecord.getTask().getId());
            dto.setTaskName(commitRecord.getTask().getTitle());
        }
        
        return dto;
    }
    
    /**
     * Extract the TASK-ID from a commit message
     * @param message Commit message
     * @return Task ID as a string or null if not found
     */
    private String extractTaskId(String message) {
        Matcher matcher = TASK_ID_PATTERN.matcher(message);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
    
    /**
     * Extract the repository full name from a GitHub URL
     * @param url GitHub repository URL
     * @return Repository full name (owner/repo) or null if invalid
     */
    private String extractRepoFullName(String url) {
        if (url == null) return null;
        
        // Handle different GitHub URL formats
        // https://github.com/owner/repo
        // https://github.com/owner/repo.git
        // git@github.com:owner/repo.git
        
        // For HTTPS URLs
        Pattern httpsPattern = Pattern.compile("https://github\\.com/([\\w-]+/[\\w-]+)(\\.git)?$");
        Matcher httpsMatcher = httpsPattern.matcher(url);
        if (httpsMatcher.find()) {
            return httpsMatcher.group(1);
        }
        
        // For SSH URLs
        Pattern sshPattern = Pattern.compile("git@github\\.com:([\\w-]+/[\\w-]+)(\\.git)?$");
        Matcher sshMatcher = sshPattern.matcher(url);
        if (sshMatcher.find()) {
            return sshMatcher.group(1);
        }
        
        return null;
    }
    
    /**
     * Convert Date to LocalDateTime
     */
    private LocalDateTime convertToLocalDateTime(Date date) {
        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }
    
    /**
     * Notify group leader about invalid commit
     */
    private void notifyLeaderAboutInvalidCommit(Group group, CommitRecord commitRecord) {
        if (group.getLeader() == null) {
            log.warn("Cannot notify about invalid commit: Group {} has no leader", group.getId());
            return;
        }
        
        String message = String.format(
                "Invalid commit detected in group %s. Commit: %s by %s. " +
                "Message: %s. Invalid TASK-ID: %s",
                group.getName(),
                commitRecord.getCommitId().substring(0, 7),
                commitRecord.getAuthorName(),
                commitRecord.getMessage(),
                commitRecord.getTaskId()
        );
        
        notificationService.notifyUser(group.getLeader(), "Invalid commit detected", message);
    }

    /**
     * Get commit count in a specific date range for a project
     * @param projectId The project ID
     * @param startDate Start date of the range
     * @param endDate End date of the range
     * @return Number of commits in the date range
     */
    public int getCommitCountInDateRange(Long projectId, LocalDateTime startDate, LocalDateTime endDate) {
        return commitRecordRepository.countByProjectIdAndTimestampBetween(projectId, startDate, endDate);
    }
}