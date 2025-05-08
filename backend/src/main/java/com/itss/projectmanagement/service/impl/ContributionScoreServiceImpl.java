package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.converter.ContributionScoreConverter;
import com.itss.projectmanagement.dto.response.contribution.ContributionScoreResponse;
import com.itss.projectmanagement.entity.*;
import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import com.itss.projectmanagement.repository.CommitRecordRepository;
import com.itss.projectmanagement.repository.ContributionScoreRepository;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.PeerReviewRepository;
import com.itss.projectmanagement.repository.TaskRepository;
import com.itss.projectmanagement.service.ContributionScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContributionScoreServiceImpl implements ContributionScoreService {
    
    private final ContributionScoreRepository contributionScoreRepository;
    private final TaskRepository taskRepository;
    private final CommitRecordRepository commitRecordRepository;
    private final GroupRepository groupRepository;
    private final ContributionScoreConverter contributionScoreConverter;
    private final PeerReviewRepository peerReviewRepository;
    
    @Override
    @Transactional
    public ContributionScore calculateScore(User user, Project project) {
        // 1. Calculate WeightedTaskCompletionScore
        Double weightedTaskCompletionScore = calculateWeightedTaskCompletionScore(user, project);
        
        // 2. Get peer review score (average from valid and completed peer reviews only)
        Double peerReviewScore = peerReviewRepository.findAverageScoreByRevieweeAndProject(user, project);
        log.info("Peer review score for user {} in project {}: {}", user.getUsername(), project.getName(), peerReviewScore);
        if (peerReviewScore == null) peerReviewScore = 0.0;
        
        // 3. Count valid commits related to user's tasks
        Long commitCount = countValidCommitsForUserTasks(user, project);
        
        // 4. Count late tasks (both completed late and past deadline but not completed)
        Long lateTaskCount = countLateTasks(user, project);
        
        // 5. Calculate final score using formula from UC007
        Double calculatedScore = calculateFinalScore(
                project,
                weightedTaskCompletionScore,
                peerReviewScore,
                commitCount,
                lateTaskCount
        );
        
        // 6. Save or update contribution score
        Optional<ContributionScore> existingScoreOpt = contributionScoreRepository.findByUserAndProject(user, project);
        
        ContributionScore contributionScore;
        if (existingScoreOpt.isPresent()) {
            contributionScore = existingScoreOpt.get();
            contributionScore.setTaskCompletionScore(weightedTaskCompletionScore);
            contributionScore.setPeerReviewScore(peerReviewScore);
            contributionScore.setCommitCount(commitCount);
            contributionScore.setLateTaskCount(lateTaskCount);
            contributionScore.setCalculatedScore(calculatedScore);
            // Keep adjusted score if present
            if (contributionScore.getAdjustedScore() == null) {
                contributionScore.setAdjustedScore(calculatedScore);
            }
            log.info("Updating existing contribution score for user {} in project {}",
                    user.getUsername(), project.getName());
        } else {
            contributionScore = ContributionScore.builder()
                    .user(user)
                    .project(project)
                    .taskCompletionScore(weightedTaskCompletionScore)
                    .peerReviewScore(peerReviewScore)
                    .commitCount(commitCount)
                    .lateTaskCount(lateTaskCount)
                    .calculatedScore(calculatedScore)
                    .adjustedScore(calculatedScore) // Default adjusted = calculated
                    .isFinal(false)
                    .build();
        }
        
        return contributionScoreRepository.save(contributionScore);
    }
    
    @Override
    @Transactional
    public List<ContributionScore> calculateScoresForProject(Project project) {
        List<ContributionScore> scores = new ArrayList<>();
        List<User> projectUsers = getAllProjectUsers(project);
        
        for (User user : projectUsers) {
            scores.add(calculateScore(user, project));
        }
        
        return scores;
    }
    
    @Override
    @Transactional
    public ContributionScoreResponse getScoreByUserAndProject(User user, Project project) {
        ContributionScore score = calculateScore(user, project);
                
        return contributionScoreConverter.toResponse(score);
    }
    
    @Override
    @Transactional 
    public List<ContributionScoreResponse> getScoresByProject(Project project) {
        // Luôn tính toán lại điểm mới nhất cho tất cả người dùng trong dự án
        log.info("Recalculating latest contribution scores for project {}", project.getName());
        List<ContributionScore> scores = calculateScoresForProject(project);
        
        return scores.stream()
                .map(contributionScoreConverter::toResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ContributionScoreResponse adjustScore(Long id, Double adjustedScore, String adjustmentReason) {
        ContributionScore score = contributionScoreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contribution score not found with id: " + id));
        
        score.setAdjustedScore(adjustedScore);
        score.setAdjustmentReason(adjustmentReason);
        
        ContributionScore updatedScore = contributionScoreRepository.save(score);
        return contributionScoreConverter.toResponse(updatedScore);
    }
    
    @Override
    @Transactional
    public List<ContributionScoreResponse> finalizeScores(Long projectId) {
        Project project = new Project();
        project.setId(projectId);
        
        List<ContributionScore> scores = contributionScoreRepository.findByProject(project);
        
        // Mark all scores as final
        for (ContributionScore score : scores) {
            score.setIsFinal(true);
            contributionScoreRepository.save(score);
        }
        
        return scores.stream()
                .map(contributionScoreConverter::toResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<ContributionScoreResponse> getScoresByGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        Project project = group.getProject();
        List<User> users = new ArrayList<>(group.getMembers());
        if (group.getLeader() != null && !users.contains(group.getLeader())) {
            users.add(group.getLeader());
        }
        List<ContributionScoreResponse> result = new ArrayList<>();
        for (User user : users) {
            result.add(getScoreByUserAndProject(user, project));
        }
        return result;
    }
    
    @Override
    public int calculateContributionScore(Long userId, Long projectId) {
        User user = new User();
        user.setId(userId);
        
        Project project = new Project();
        project.setId(projectId);
        
        // First check if we have an existing score saved
        Optional<ContributionScore> existingScoreOpt = contributionScoreRepository.findByUserAndProject(user, project);
        
        if (existingScoreOpt.isPresent()) {
            // Use the adjusted score if available, otherwise the calculated score
            ContributionScore score = existingScoreOpt.get();
            Double finalScore = score.getAdjustedScore() != null ? score.getAdjustedScore() : score.getCalculatedScore();
            
            // Convert to integer scale (0-100)
            return convertScoreToIntegerScale(finalScore);
        } else {
            // No existing score, calculate a new one
            ContributionScore newScore = calculateScore(user, project);
            Double finalScore = newScore.getAdjustedScore() != null ? newScore.getAdjustedScore() : newScore.getCalculatedScore();
            
            // Convert to integer scale (0-100)
            return convertScoreToIntegerScale(finalScore);
        }
    }
    
    /**
     * Convert the contribution score to an integer scale (0-100)
     * This normalizes scores that could have different ranges based on project weights
     */
    private int convertScoreToIntegerScale(Double score) {
        if (score == null) return 0;
        
        // For scores below zero, return minimum score (likely due to many late tasks)
        if (score < 0) return 0;
        
        // Cap at 100 for very high scores
        // Typical scores might be in 0-50 range depending on project weights
        // Using 50 as a typical "excellent" score to map to 100
        double normalizedScore = Math.min(100, (score / 50.0) * 100);
        
        return (int) Math.round(normalizedScore);
    }
    
    /**
     * Calculate weighted task completion score based on difficulty level
     */
    private Double calculateWeightedTaskCompletionScore(User user, Project project) {
        List<Task> completedTasks = taskRepository.findByAssigneeAndGroupProjectAndStatus(
                user, project, TaskStatus.COMPLETED);
        
        double score = 0.0;
        
        for (Task task : completedTasks) {
            // Use getValue() method from DifficultyLevel enum
            score += task.getDifficulty().getValue();
        }
        
        return score;
    }
    
    /**
     * Count valid commits for tasks assigned to a user
     * Uses the [TASK-ID] convention in commit messages
     */
    private Long countValidCommitsForUserTasks(User user, Project project) {
        log.info("Counting commits for user {} in project {}", user.getUsername(), project.getName());
        
        // Get all tasks assigned to this user in this project
        List<Task> userTasks = taskRepository.findByAssignee(user);
        log.info("Found {} total tasks assigned to user {}", userTasks.size(), user.getUsername());
        
        // Filter to only tasks in the current project
        userTasks = userTasks.stream()
                .filter(task -> task.getGroup() != null && 
                       task.getGroup().getProject() != null && 
                       task.getGroup().getProject().getId().equals(project.getId()))
                .toList();
        
        log.info("After filtering, found {} tasks for user {} in project {}", 
                userTasks.size(), user.getUsername(), project.getName());
        
        if (userTasks.isEmpty()) {
            log.info("No tasks found for user {} in project {}, returning 0 commits", 
                    user.getUsername(), project.getName());
            return 0L;
        }
        
        // Approach 1: Direct SQL query for better performance
        // Get all commit records for tasks in this project by this user
        long directCommitCount = 0;
        for (Task task : userTasks) {
            List<CommitRecord> commits = commitRecordRepository.findByTask(task);
            log.info("Task ID {}: Found {} commits directly linked by Task object", 
                    task.getId(), commits.size());
            directCommitCount += commits.size();
            
            // For debugging, show details of each commit
            for (CommitRecord commit : commits) {
                log.info("Task {} - Commit detail: id={}, message={}, isValid={}, taskId={}", 
                        task.getId(), commit.getId(), commit.getMessage(), commit.isValid(), commit.getTaskId());
            }
        }
        
        // Approach 2: Check commits by string taskId as well
        long stringTaskIdCommitCount = 0;
        for (Task task : userTasks) {
            String taskIdStr = String.valueOf(task.getId());
            
            // Use direct repository method instead of loading all commits
            List<CommitRecord> allCommits = commitRecordRepository.findAll();
            List<CommitRecord> matchingCommits = allCommits.stream()
                    .filter(commit -> commit.isValid() && 
                            taskIdStr.equals(commit.getTaskId()) && 
                            (commit.getTask() == null || !commit.getTask().getId().equals(task.getId())))
                    .toList();
            
            log.info("Task ID {}: Found {} additional commits by string taskId", 
                    task.getId(), matchingCommits.size());
            
            for (CommitRecord commit : matchingCommits) {
                log.info("Additional commit for task {}: id={}, message={}, valid={}", 
                        task.getId(), commit.getId(), commit.getMessage(), commit.isValid());
            }
            
            stringTaskIdCommitCount += matchingCommits.size();
        }
        
        long totalCommitCount = directCommitCount + stringTaskIdCommitCount;
        log.info("Total commit count for user {}: {} (direct: {}, by string: {})",
                user.getUsername(), totalCommitCount, directCommitCount, stringTaskIdCommitCount);
        
        return totalCommitCount;
    }
    
    /**
     * Count late tasks - both completed late and past deadline but not completed
     */
    private Long countLateTasks(User user, Project project) {
        long lateCount = 0;
        
        // 1. Count completed tasks that were completed after the deadline
        List<Task> completedTasks = taskRepository.findByAssigneeAndGroupProjectAndStatus(
                user, project, TaskStatus.COMPLETED);
        
        lateCount += completedTasks.stream()
                .filter(task -> {
                    LocalDate completionDate = task.getUpdatedAt().toLocalDate();
                    return completionDate.isAfter(task.getDeadline());
                })
                .count();
        
        // 2. Count overdue tasks that are not completed yet
        List<Task> overdueTasks = taskRepository.findOverdueTasksByAssigneeAndProject(
                user, project, LocalDate.now(), TaskStatus.COMPLETED);
        
        lateCount += overdueTasks.size();
        
        return lateCount;
    }
    
    /**
     * Calculate final score using the formula from UC007:
     * Điểm = (W1 * WeightedTaskCompletionScore) + (W2 * Điểm_ĐánhGiáChéo_TrungBình) 
     *        + (W3 * Số_Commit_LiênQuan) - (W4 * Số_Task_TrễHạn)
     */
    private Double calculateFinalScore(
            Project project,
            Double weightedTaskCompletionScore,
            Double peerReviewScore,
            Long commitCount,
            Long lateTaskCount
    ) {
        double w1 = project.getWeightW1();
        double w2 = project.getWeightW2();
        double w3 = project.getWeightW3();
        double w4 = project.getWeightW4();
        
        return (w1 * weightedTaskCompletionScore) +
               (w2 * peerReviewScore) +
               (w3 * commitCount) -
               (w4 * lateTaskCount);
    }
    
    /**
     * Get all users in a project across all groups
     */
    private List<User> getAllProjectUsers(Project project) {
        List<Group> groups = groupRepository.findByProject(project);
        List<User> users = new ArrayList<>();
        
        for (Group group : groups) {
            users.addAll(group.getMembers());
            if (group.getLeader() != null && !users.contains(group.getLeader())) {
                users.add(group.getLeader());
            }
        }
        
        return users;
    }
}