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
import com.itss.projectmanagement.service.IContributionScoreService;
import com.itss.projectmanagement.utils.ScoreNormalizationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContributionScoreServiceImpl implements IContributionScoreService {
    
    private final ContributionScoreRepository contributionScoreRepository;
    private final TaskRepository taskRepository;
    private final CommitRecordRepository commitRecordRepository;
    private final GroupRepository groupRepository;
    private final ContributionScoreConverter contributionScoreConverter;
    private final PeerReviewRepository peerReviewRepository;
    
    // Code contribution weights as per requirements
    private static final double WEIGHT_ADDITIONS = 1.0;   // wₐ = 1.0
    private static final double WEIGHT_DELETIONS = 1.25;  // w_d = 1.25
    private static final int MAX_COMMIT_SCORE_CAP = 1000; // Soft cap to prevent library bump distortion
    
    @Override
    @Transactional
    public void calculateScore(User user, Project project) {
        log.info("Calculating normalized contribution score for user {} in project {}", user.getUsername(), project.getName());
        
        // Validate weight constraints
        if (!isWeightSumValid(project)) {
            throw new IllegalStateException(
                String.format("Project weights invalid: W1(%s) + W2(%s) + W3(%s) = %s ≠ 1.0", 
                    String.format("%.3f", project.getWeightW1()), 
                    String.format("%.3f", project.getWeightW2()), 
                    String.format("%.3f", project.getWeightW3()),
                    String.format("%.3f", project.getWeightW1() + project.getWeightW2() + project.getWeightW3()))
            );
        }
        
        if (!isW4Valid(project)) {
            throw new IllegalStateException(
                String.format("Project penalty weight W4 must be non-negative: %s", 
                    String.format("%.3f", project.getWeightW4()))
            );
        }
        
        // 1. Calculate raw component scores for this user
        Double rawTaskCompletionScore = calculateWeightedTaskCompletionScore(user, project);
        Double rawPeerReviewScore = calculateAveragePeerReviewScore(user, project);
        CodeContributionStats codeStats = calculateCodeContributionStats(user, project);
        Double rawCodeContributionScore = codeStats.contributionScore();
        Long lateTaskCount = countLateTasks(user, project);
        
        log.info("Raw scores for user {}: Task={}, PeerReview={}, Code={}, LateTasks={}", 
                user.getUsername(), rawTaskCompletionScore, rawPeerReviewScore, rawCodeContributionScore, lateTaskCount);
        
        // 2. Get all project users for normalization
        List<User> projectUsers = getAllProjectUsers(project);
        
        // 3. Calculate raw scores for all users (needed for normalization)
        Map<User, ComponentScores> allUserScores = calculateRawComponentScores(projectUsers, project);
        
        // 4. Normalize each component to 0-10 scale within the project
        NormalizedScores normalizedScores = normalizeComponentScores(user, allUserScores, projectUsers);
        
        // 5. Calculate final normalized score (0-10 scale)
        Double finalScore = calculateNormalizedFinalScore(
                project, normalizedScores, lateTaskCount);
        
        log.info("Normalized scores for user {}: Task={}, PeerReview={}, Code={}, FinalScore={}", 
                user.getUsername(), 
                String.format("%.2f", normalizedScores.taskCompletion), 
                String.format("%.2f", normalizedScores.peerReview), 
                String.format("%.2f", normalizedScores.codeContribution), 
                String.format("%.2f", finalScore));
        
        // 6. Save or update contribution score
        saveContributionScore(user, project, normalizedScores, codeStats, lateTaskCount, finalScore);
    }
    
    @Override
    @Transactional
    public void calculateScoresForProject(Project project) {
        log.info("Calculating normalized scores for all users in project: {}", project.getName());
        
        List<User> projectUsers = getAllProjectUsers(project);
        log.info("Found {} users in project {}", projectUsers.size(), project.getName());
        
        // Calculate all users' scores in batch for proper normalization
        Map<User, ComponentScores> allUserScores = calculateRawComponentScores(projectUsers, project);
        
        // Normalize scores across all users using new List-based approach
        Map<User, NormalizedScores> normalizedScoresMap = normalizeAllComponentScores(allUserScores, projectUsers);
        
        // Calculate and save final scores for each user
        for (User user : projectUsers) {
            NormalizedScores normalizedScores = normalizedScoresMap.get(user);
            ComponentScores rawScores = allUserScores.get(user);
            
            Long lateTaskCount = rawScores.lateTaskCount;
            Double finalScore = calculateNormalizedFinalScore(project, normalizedScores, lateTaskCount);
            
            log.info("User {}: Normalized Task={}, PeerReview={}, Code={}, Final={}", 
                    user.getUsername(), 
                    String.format("%.2f", normalizedScores.taskCompletion), 
                    String.format("%.2f", normalizedScores.peerReview), 
                    String.format("%.2f", normalizedScores.codeContribution), 
                    String.format("%.2f", finalScore));
            
            saveContributionScore(user, project, normalizedScores, rawScores.codeStats, lateTaskCount, finalScore);
        }
        
        log.info("Completed normalized score calculation for project: {}", project.getName());
    }
    
    /**
     * Calculate raw component scores for a user (before normalization)
     */
    private ComponentScores calculateRawComponentScores(User user, Project project) {
        Double taskCompletionScore = calculateWeightedTaskCompletionScore(user, project);
        Double peerReviewScore = calculateAveragePeerReviewScore(user, project);
        CodeContributionStats codeStats = calculateCodeContributionStats(user, project);
        Long lateTaskCount = countLateTasks(user, project);
        
        return new ComponentScores(taskCompletionScore, peerReviewScore, codeStats, lateTaskCount);
    }
    
    /**
     * Calculate raw component scores for all users in the project
     */
    private Map<User, ComponentScores> calculateRawComponentScores(List<User> users, Project project) {
        Map<User, ComponentScores> result = new HashMap<>();
        for (User user : users) {
            ComponentScores scores = calculateRawComponentScores(user, project);
            result.put(user, scores);
        }
        return result;
    }
    
    /**
     * Normalize component scores for all users in the project - FIXED VERSION
     * Uses List-based normalization to avoid duplicate key issues
     */
    private Map<User, NormalizedScores> normalizeAllComponentScores(Map<User, ComponentScores> allUserScores, List<User> orderedUsers) {
        // Extract lists of each component score in user order
        List<Double> taskScores = orderedUsers.stream()
                .map(user -> allUserScores.get(user).taskCompletionScore)
                .collect(Collectors.toList());
        
        List<Double> peerScores = orderedUsers.stream()
                .map(user -> allUserScores.get(user).peerReviewScore)
                .collect(Collectors.toList());
        
        List<Double> codeScores = orderedUsers.stream()
                .map(user -> allUserScores.get(user).codeStats.contributionScore())
                .collect(Collectors.toList());
        
        // Normalize each component using new List-based method
        List<Double> normalizedTaskScores = ScoreNormalizationUtils.normalizeScoresAsList(taskScores);
        List<Double> normalizedPeerScores = ScoreNormalizationUtils.normalizeScoresAsList(peerScores);
        List<Double> normalizedCodeScores = ScoreNormalizationUtils.normalizeScoresAsList(codeScores);
        
        log.info("Task scores normalization: {} -> {}", 
                ScoreNormalizationUtils.calculateStats(taskScores),
                ScoreNormalizationUtils.calculateStats(normalizedTaskScores));
        
        // Map back to users using indices
        Map<User, NormalizedScores> result = new HashMap<>();
        for (int i = 0; i < orderedUsers.size(); i++) {
            User user = orderedUsers.get(i);
            Double normalizedTask = normalizedTaskScores.get(i);
            Double normalizedPeer = normalizedPeerScores.get(i);
            Double normalizedCode = normalizedCodeScores.get(i);
            
            result.put(user, new NormalizedScores(normalizedTask, normalizedPeer, normalizedCode));
        }
        
        return result;
    }
    
    /**
     * Normalize component scores for a single user (when called individually)
     */
    private NormalizedScores normalizeComponentScores(User user, Map<User, ComponentScores> allUserScores, List<User> orderedUsers) {
        Map<User, NormalizedScores> normalizedMap = normalizeAllComponentScores(allUserScores, orderedUsers);
        return normalizedMap.get(user);
    }
    
    /**
     * Calculate final normalized score using the formula:
     * FinalScore = (W1 × NormalizedTask) + (W2 × NormalizedPeer) + (W3 × NormalizedCode) - (W4 × LateTasks)
     * Result is clamped to 0-10 range
     */
    private Double calculateNormalizedFinalScore(
            Project project, 
            NormalizedScores normalizedScores, 
            Long lateTaskCount) {
        
        double weightedSum = (project.getWeightW1() * normalizedScores.taskCompletion) +
                           (project.getWeightW2() * normalizedScores.peerReview) +
                           (project.getWeightW3() * normalizedScores.codeContribution);
        
        double finalScore = weightedSum - (project.getWeightW4() * lateTaskCount);
        
        // Clamp result to 0-10 range
        finalScore = Math.max(0.0, Math.min(10.0, finalScore));
        
        log.debug("Final score calculation: ({} × {}) + ({} × {}) + ({} × {}) - ({} × {}) = {} (clamped to {})",
                String.format("%.3f", project.getWeightW1()), String.format("%.2f", normalizedScores.taskCompletion),
                String.format("%.3f", project.getWeightW2()), String.format("%.2f", normalizedScores.peerReview),
                String.format("%.3f", project.getWeightW3()), String.format("%.2f", normalizedScores.codeContribution),
                String.format("%.3f", project.getWeightW4()), lateTaskCount,
                String.format("%.3f", weightedSum - (project.getWeightW4() * lateTaskCount)),
                String.format("%.2f", finalScore));
        
        return finalScore;
    }
    
    /**
     * Save or update contribution score with normalized values
     */
    private void saveContributionScore(User user, Project project, NormalizedScores normalizedScores, 
                                     CodeContributionStats codeStats, Long lateTaskCount, Double finalScore) {
        Optional<ContributionScore> existingScore = contributionScoreRepository.findByUserAndProject(user, project);
        
        ContributionScore score;
        if (existingScore.isPresent()) {
            score = existingScore.get();
        } else {
            score = new ContributionScore();
            score.setUser(user);
            score.setProject(project);
        }
        
        // Set normalized component scores (0-10 scale)
        score.setTaskCompletionScore(normalizedScores.taskCompletion);
        score.setPeerReviewScore(normalizedScores.peerReview);
        score.setCodeContributionScore(normalizedScores.codeContribution); // This is now normalized too
        score.setLateTaskCount(lateTaskCount);
        
        // Set raw code statistics for reference
        score.setTotalAdditions(codeStats.totalAdditions);
        score.setTotalDeletions(codeStats.totalDeletions);
        
        // Set final calculated score (0-10 scale)
        score.setCalculatedScore(finalScore);
        
        // Only set adjustedScore if it was manually adjusted (keep null for auto-calculated scores)
        // This allows frontend to distinguish between calculated vs manually adjusted scores
        // adjustedScore will only be set when instructor manually adjusts via adjustScore() method
        
        // Reset finalization status when scores are recalculated
        score.setIsFinal(false);
        
        contributionScoreRepository.save(score);
        
        log.debug("Saved contribution score for user {} in project {}: final score = {}", 
                user.getUsername(), project.getName(), String.format("%.2f", finalScore));
    }
    
    /**
     * Validate that W1 + W2 + W3 = 1.0
     */
    private boolean isWeightSumValid(Project project) {
        if (project.getWeightW1() == null || project.getWeightW2() == null || project.getWeightW3() == null) {
            return false;
        }
        double sum = project.getWeightW1() + project.getWeightW2() + project.getWeightW3();
        return Math.abs(sum - 1.0) < 0.001; // Small tolerance for floating point
    }
    
    /**
     * Validate that W4 >= 0 (penalty factor should not be negative)
     */
    private boolean isW4Valid(Project project) {
        return project.getWeightW4() != null && project.getWeightW4() >= 0.0;
    }
    
    @Override
    @Transactional
    public ContributionScoreResponse getScoreByUserAndProject(User user, Project project) {
        Optional<ContributionScore> scoreOpt = contributionScoreRepository.findByUserAndProject(user, project);
        
        if (scoreOpt.isPresent()) {
            return contributionScoreConverter.toResponse(scoreOpt.get());
        } else {
            // Calculate scores if not found
            calculateScore(user, project);
            ContributionScore score = contributionScoreRepository.findByUserAndProject(user, project)
                    .orElseThrow(() -> new ResourceNotFoundException("Failed to calculate contribution score"));
            return contributionScoreConverter.toResponse(score);
        }
    }
    
    @Override
    @Transactional 
    public List<ContributionScoreResponse> getScoresByProject(Project project) {
        return contributionScoreRepository.findByProject(project).stream()
                .map(contributionScoreConverter::toResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ContributionScoreResponse adjustScore(Long id, Double adjustedScore, String adjustmentReason) {
        ContributionScore score = contributionScoreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contribution score not found with id: " + id));
        
        // Validate adjusted score is in 0-10 range
        if (adjustedScore < 0.0 || adjustedScore > 10.0) {
            throw new IllegalArgumentException("Adjusted score must be between 0.0 and 10.0");
        }
        
        // Log the adjustment for audit purposes
        log.info("Score adjustment: User {} in project {}: {} -> {} (reason: {})", 
                score.getUser().getUsername(), 
                score.getProject().getName(),
                String.format("%.2f", score.getAdjustedScore()),
                String.format("%.2f", adjustedScore),
                adjustmentReason);
        
        score.setAdjustedScore(adjustedScore);
        score.setAdjustmentReason(adjustmentReason);
        
        // FIXED: Update timestamp and reset final status on manual adjustment
        score.setUpdatedAt(LocalDateTime.now());
        score.setIsFinal(false); // Manual adjustments require re-finalization
        
        ContributionScore updatedScore = contributionScoreRepository.save(score);
        return contributionScoreConverter.toResponse(updatedScore);
    }
    
    @Override
    @Transactional
    public List<ContributionScoreResponse> finalizeScores(Long projectId) {
        Project project = new Project();
        project.setId(projectId);
        
        List<ContributionScore> scores = contributionScoreRepository.findByProject(project);
        
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
        
        // Use Set to avoid duplicates and collect user IDs first
        Set<Long> userIds = new HashSet<>();
        List<User> users = new ArrayList<>();
        
        // Add all members
        for (User member : group.getMembers()) {
            if (userIds.add(member.getId())) { // add() returns true if not already present
                users.add(member);
            }
        }
        
        // Add leader if not already included
        if (group.getLeader() != null && userIds.add(group.getLeader().getId())) {
            users.add(group.getLeader());
        }
        
        log.debug("Getting scores for group {}: found {} unique users", groupId, users.size());
        
        List<ContributionScoreResponse> result = new ArrayList<>();
        for (User user : users) {
            result.add(getScoreByUserAndProject(user, project));
        }
        return result;
    }
    
    /**
     * Calculate weighted task completion score based on difficulty level
     */
    private Double calculateWeightedTaskCompletionScore(User user, Project project) {
        List<Task> completedTasks = taskRepository.findByAssigneeAndGroupProjectAndStatus(
                user, project, TaskStatus.COMPLETED);
        
        double score = 0.0;
        
        for (Task task : completedTasks) {
            score += task.getDifficulty().getValue();
        }
        
        return score;
    }
    
    /**
     * Count late tasks - FIXED to use completedAt instead of updatedAt
     * Late tasks are those completed after deadline OR still incomplete past deadline
     */
    private Long countLateTasks(User user, Project project) {
        log.debug("Counting late tasks for user {} in project {}", user.getUsername(), project.getName());
        
        List<Task> userTasks = taskRepository.findByAssigneeAndGroup_Project(user, project);
        LocalDateTime now = LocalDateTime.now();
        
        long lateCount = userTasks.stream()
                .mapToLong(task -> {
                    LocalDateTime dueDate = task.getDeadline().atStartOfDay();

                    // Case 1: Task is completed but late (completedAt > dueDate)
                    if (task.getStatus() == TaskStatus.COMPLETED && task.getCompletedAt() != null) {
                        if (task.getCompletedAt().isAfter(dueDate)) {
                            log.trace("Task {} completed late: completed={}, due={}", 
                                    task.getTitle(), task.getCompletedAt(), dueDate);
                            return 1;
                        }
                    }
                    // Case 2: Task is not completed and past due date
                    else if (task.getStatus() != TaskStatus.COMPLETED && now.isAfter(dueDate)) {
                        log.trace("Task {} overdue and incomplete: due={}, now={}", 
                                task.getTitle(), dueDate, now);
                        return 1;
                    }
                    
                    return 0;
                })
                .sum();
        
        log.debug("User {} has {} late tasks in project {}", user.getUsername(), lateCount, project.getName());
        return lateCount;
    }
    
    /**
     * Calculate average peer review score for a user
     */
    private Double calculateAveragePeerReviewScore(User user, Project project) {
        Double peerReviewScore = peerReviewRepository.findAverageScoreByRevieweeAndProject(user, project);
        return peerReviewScore != null ? peerReviewScore : 0.0;
    }
    
    /**
     * Calculate code contribution statistics using OPTIMIZED batch query
     * This replaces the N+1 query problem with a single aggregate query
     */
    private CodeContributionStats calculateCodeContributionStats(User user, Project project) {
        log.debug("Calculating code contribution stats for user {} in project {}", user.getUsername(), project.getName());
        
        // Get all tasks assigned to this user in the project
        List<Task> userTasks = taskRepository.findByAssigneeAndGroup_Project(user, project);
        
        if (userTasks.isEmpty()) {
            log.debug("No tasks found for user {} in project {}", user.getUsername(), project.getName());
            return new CodeContributionStats(0L, 0L);
        }
        
        // FIXED: Use batch query instead of N queries
        List<Long> taskIds = userTasks.stream().map(Task::getId).collect(Collectors.toList());
        
        // Single optimized query to get all commit stats
        CommitRecordRepository.CodeContributionSummary summary = 
                commitRecordRepository.calculateCodeContributionForTasks(taskIds, MAX_COMMIT_SCORE_CAP);
        
        Long totalAdditions = summary.getTotalAdditions();
        Long totalDeletions = summary.getTotalDeletions();
        
        log.debug("Code stats for user {} in project {}: additions={}, deletions={} (capped at {})", 
                user.getUsername(), project.getName(), totalAdditions, totalDeletions, MAX_COMMIT_SCORE_CAP);
        
        return new CodeContributionStats(totalAdditions, totalDeletions);
    }
    
    /**
     * Get all users in a project across all groups
     */
    private List<User> getAllProjectUsers(Project project) {
        List<Group> groups = groupRepository.findByProject(project);
        Set<Long> userIds = new HashSet<>();
        List<User> users = new ArrayList<>();
        
        for (Group group : groups) {
            // Add all members
            for (User member : group.getMembers()) {
                if (userIds.add(member.getId())) { // add() returns true if not already present
                    users.add(member);
                }
            }
            
            // Add leader if not already included
            if (group.getLeader() != null && userIds.add(group.getLeader().getId())) {
                users.add(group.getLeader());
            }
        }
        
        log.debug("Found {} unique users across {} groups in project {}", 
                users.size(), groups.size(), project.getName());
        
        return users;
    }
    
    /**
     * Record classes for internal data structures
     */
    private record ComponentScores(
            Double taskCompletionScore,
            Double peerReviewScore, 
            CodeContributionStats codeStats,
            Long lateTaskCount
    ) {}
    
    private record NormalizedScores(
            Double taskCompletion,
            Double peerReview,
            Double codeContribution
    ) {}
    
    private record CodeContributionStats(Long totalAdditions, Long totalDeletions) {
        /**
         * Calculate contribution score using weighted formula
         */
        public Double contributionScore() {
            return (totalAdditions * WEIGHT_ADDITIONS) + (totalDeletions * WEIGHT_DELETIONS);
        }
    }
}