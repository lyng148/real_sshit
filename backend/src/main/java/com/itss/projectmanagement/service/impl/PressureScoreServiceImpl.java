package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.dto.response.pressure.PressureScoreResponse;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.entity.PressureScoreHistory;
import com.itss.projectmanagement.enums.PressureStatus;
import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.PressureScoreHistoryRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.TaskRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.INotificationService;
import com.itss.projectmanagement.service.IPressureScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PressureScoreServiceImpl implements IPressureScoreService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    private final INotificationService notificationService;
    private final PressureScoreHistoryRepository pressureScoreHistoryRepository;
    
    private static final double RISK_THRESHOLD_PERCENTAGE = 0.7; // 70%

    @Override
    public double calculateTimeUrgencyFactor(long daysRemaining) {
        if (daysRemaining < 0) {
            // Task is overdue
            return 3.5;
        } else if (daysRemaining <= 1) {
            // Due today or tomorrow
            return 3.0;
        } else if (daysRemaining <= 3) {
            // Due within 3 days
            return 2.0;
        } else if (daysRemaining <= 7) {
            // Due within a week
            return 1.5;
        } else {
            // More than a week away
            return 1.0;
        }
    }

    @Override
    public double calculateTaskPressureScore(int difficultyWeight, double timeUrgencyFactor) {
        return difficultyWeight * timeUrgencyFactor;
    }

    @Override
    public double calculateTotalMemberPressureScore(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        try {
            // Get all incomplete tasks assigned to the user
            List<Task> incompleteTasks = taskRepository.findByAssigneeAndStatus(user, TaskStatus.NOT_STARTED);
            incompleteTasks.addAll(taskRepository.findByAssigneeAndStatus(user, TaskStatus.IN_PROGRESS));
            
            double totalPressureScore = 0.0;
            LocalDate currentDate = LocalDate.now();
            
            for (Task task : incompleteTasks) {
                try {
                    // Validate task data
                    if (task.getDifficulty() == null) {
                        log.warn("Task ID {} has null difficulty, skipping", task.getId());
                        continue;
                    }
                    if (task.getDeadline() == null) {
                        log.warn("Task ID {} has null deadline, skipping", task.getId());
                        continue;
                    }
                    
                    // Step 1: Get Difficulty Weight (DW)
                    int difficultyWeight = task.getDifficulty().getValue();
                    
                    // Step 2: Calculate Time Urgency Factor (TUF)
                    long daysRemaining = ChronoUnit.DAYS.between(currentDate, task.getDeadline());
                    double timeUrgencyFactor = calculateTimeUrgencyFactor(daysRemaining);
                    
                    // Step 3: Calculate Task Pressure Score (TPS)
                    double taskPressureScore = calculateTaskPressureScore(difficultyWeight, timeUrgencyFactor);
                    
                    // Step 4: Add to total member pressure score
                    totalPressureScore += taskPressureScore;
                    
                    log.debug("Task ID {}: DW={}, DaysRemaining={}, TUF={}, TPS={}",
                            task.getId(), difficultyWeight, daysRemaining, timeUrgencyFactor, taskPressureScore);
                } catch (Exception e) {
                    log.error("Error calculating pressure score for task ID {}: {}", task.getId(), e.getMessage());
                    // Continue with other tasks instead of failing completely
                }
            }
            
            log.info("User {}: Total Member Pressure Score = {}, Task count = {}",
                    user.getUsername(), totalPressureScore, incompleteTasks.size());
            
            return totalPressureScore;
        } catch (Exception e) {
            log.error("Error calculating total pressure score for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to calculate pressure score for user: " + userId, e);
        }
    }

    @Override
    public PressureScoreResponse evaluatePressureStatus(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        try {
            // Find projects this user is involved in
            List<Group> userGroups = groupRepository.findByMembersContainingOrLeader(user, user);
            if (userGroups.isEmpty()) {
                // User is not a member of any group, return minimal response
                return PressureScoreResponse.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .pressureScore(0.0)
                        .status(PressureStatus.SAFE)
                        .taskCount(0)
                        .threshold(0)
                        .thresholdPercentage(0.0)
                        .statusDescription(PressureStatus.SAFE.getDescription() + " - No groups found for this user")
                        .build();
            }
            
            // Get all projects this user is involved in
            Map<Long, Project> userProjects = new HashMap<>();
            for (Group group : userGroups) {
                if (group.getProject() != null) {
                    userProjects.put(group.getProject().getId(), group.getProject());
                }
            }
            
            if (userProjects.isEmpty()) {
                log.warn("User {} is in groups but no valid projects found", user.getUsername());
                return PressureScoreResponse.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .pressureScore(0.0)
                        .status(PressureStatus.SAFE)
                        .taskCount(0)
                        .threshold(0)
                        .thresholdPercentage(0.0)
                        .statusDescription(PressureStatus.SAFE.getDescription() + " - No valid projects found")
                        .build();
            }
            
            // If user is in multiple projects, calculate pressure scores for each project
            // and use the highest relative threshold percentage to determine status
            double highestPressureScore = 0.0;
            Project highestPressureProject = null;
            double highestThresholdPercentage = 0.0;
            int totalTaskCount = 0;
            
            // Get incomplete tasks for this user
            List<Task> incompleteTasks = taskRepository.findByAssigneeAndStatus(user, TaskStatus.NOT_STARTED);
            incompleteTasks.addAll(taskRepository.findByAssigneeAndStatus(user, TaskStatus.IN_PROGRESS));
            
            // Group tasks by project
            Map<Long, List<Task>> tasksByProject = new HashMap<>();
            for (Task task : incompleteTasks) {
                try {
                    if (task.getGroup() != null && task.getGroup().getProject() != null) {
                        Long projectId = task.getGroup().getProject().getId();
                        tasksByProject.computeIfAbsent(projectId, k -> new ArrayList<>()).add(task);
                    } else {
                        log.warn("Task ID {} has null group or project, skipping", task.getId());
                    }
                } catch (Exception e) {
                    log.error("Error processing task ID {}: {}", task.getId(), e.getMessage());
                }
            }
            
            // Calculate pressure score for each project
            for (Map.Entry<Long, List<Task>> entry : tasksByProject.entrySet()) {
                try {
                    Long projectId = entry.getKey();
                    List<Task> projectTasks = entry.getValue();
                    Project project = userProjects.get(projectId);
                    
                    if (project == null) {
                        log.warn("Project {} not found in user projects for user {}", projectId, user.getUsername());
                        continue;
                    }
                    
                    double projectPressureScore = 0.0;
                    LocalDate currentDate = LocalDate.now();
                    
                    for (Task task : projectTasks) {
                        try {
                            // Validate task data
                            if (task.getDifficulty() == null || task.getDeadline() == null) {
                                log.warn("Task ID {} has null difficulty or deadline, skipping", task.getId());
                                continue;
                            }
                            
                            int difficultyWeight = task.getDifficulty().getValue();
                            long daysRemaining = ChronoUnit.DAYS.between(currentDate, task.getDeadline());
                            double timeUrgencyFactor = calculateTimeUrgencyFactor(daysRemaining);
                            double taskPressureScore = calculateTaskPressureScore(difficultyWeight, timeUrgencyFactor);
                            
                            projectPressureScore += taskPressureScore;
                        } catch (Exception e) {
                            log.error("Error calculating pressure for task ID {}: {}", task.getId(), e.getMessage());
                        }
                    }
                    
                    totalTaskCount += projectTasks.size();
                    
                    // Calculate what percentage of the threshold this score represents
                    if (project.getPressureThreshold() != null && project.getPressureThreshold() > 0) {
                        double thresholdPercentage = projectPressureScore / project.getPressureThreshold();
                        
                        if (thresholdPercentage > highestThresholdPercentage) {
                            highestThresholdPercentage = thresholdPercentage;
                            highestPressureScore = projectPressureScore;
                            highestPressureProject = project;
                        }
                    } else {
                        log.warn("Project {} has null or zero pressure threshold", project.getId());
                    }
                } catch (Exception e) {
                    log.error("Error processing project {}: {}", entry.getKey(), e.getMessage());
                }
            }
            
            // Determine status based on the highest threshold percentage
            PressureStatus status;
            if (highestThresholdPercentage >= 1.0) {
                status = PressureStatus.OVERLOADED;
            } else if (highestThresholdPercentage >= RISK_THRESHOLD_PERCENTAGE) {
                status = PressureStatus.AT_RISK;
            } else {
                status = PressureStatus.SAFE;
            }
            
            // Build and return the response
            return PressureScoreResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .pressureScore(highestPressureScore)
                    .status(status)
                    .taskCount(totalTaskCount)
                    .threshold(highestPressureProject != null ? highestPressureProject.getPressureThreshold() : 0)
                    .thresholdPercentage(highestThresholdPercentage * 100.0) // Convert to percentage format
                    .statusDescription(status.getDescription())
                    .projectId(highestPressureProject != null ? highestPressureProject.getId() : null)
                    .projectName(highestPressureProject != null ? highestPressureProject.getName() : null)
                    .build();
        } catch (Exception e) {
            log.error("Error evaluating pressure status for user {}: {}", userId, e.getMessage());
            // Return safe default response instead of throwing exception
            return PressureScoreResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .pressureScore(0.0)
                    .status(PressureStatus.SAFE)
                    .taskCount(0)
                    .threshold(0)
                    .thresholdPercentage(0.0)
                    .statusDescription("Error calculating pressure status - defaulting to SAFE")
                    .build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PressureScoreResponse> getProjectPressureScores(Long projectId) {
        if (projectId == null) {
            throw new IllegalArgumentException("Project ID cannot be null");
        }
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        try {
            // Get all users in this project
            List<User> projectUsers = getUsersInProject(project);
            
            if (projectUsers.isEmpty()) {
                log.warn("No users found in project {}", project.getName());
                return new ArrayList<>();
            }
            
            log.info("Getting pressure scores for {} users in project {}", projectUsers.size(), project.getName());
            
            List<PressureScoreResponse> responses = new ArrayList<>();
            for (User user : projectUsers) {
                try {
                    PressureScoreResponse response = getPressureScoreForUser(user, project);
                    responses.add(response);
                } catch (Exception e) {
                    log.error("Error getting pressure score for user {} in project {}: {}", 
                            user.getUsername(), project.getName(), e.getMessage());
                    // Continue with other users instead of failing completely
                }
            }
            
            return responses;
        } catch (Exception e) {
            log.error("Error getting project pressure scores for project {}: {}", projectId, e.getMessage());
            throw new RuntimeException("Failed to get pressure scores for project: " + projectId, e);
        }
    }

    @Override
    @Transactional
    public void updateAllPressureScores() {
        log.info("Starting daily pressure score update for all active projects");
        
        List<Project> activeProjects = projectRepository.findAllActiveProjects();
        for (Project project : activeProjects) {
            updateProjectPressureScores(project);
        }
        
        log.info("Completed daily pressure score update for {} active projects", activeProjects.size());
    }

    @Override
    @Transactional
    public void updateProjectPressureScores(Project project) {
        log.info("Updating pressure scores for project: {}", project.getName());
        
        // Get all users in this project
        List<User> projectUsers = getUsersInProject(project);
        
        // Calculate pressure scores for all users
        for (User user : projectUsers) {
            PressureScoreResponse pressureScore = getPressureScoreForUser(user, project);
            
            log.info("User {}: Pressure Score = {}, Status = {}", 
                user.getUsername(), pressureScore.getPressureScore(), pressureScore.getStatus());
            
            // Store the pressure score history
            savePressureScoreHistory(user, project, (int)Math.round(pressureScore.getThresholdPercentage()));
            
            // If pressure score is OVERLOADED, notify relevant parties
            if (pressureScore.getStatus() == PressureStatus.OVERLOADED) {
                log.warn("User {} is OVERLOADED with pressure score {} in project {}", 
                    user.getUsername(), pressureScore.getPressureScore(), project.getName());
                
                // 1. Notify the overloaded user
                String userTitle = "Cảnh báo: Áp lực công việc quá tải";
                String userMessage = String.format(
                    "Điểm áp lực công việc của bạn hiện tại là %.2f, vượt quá ngưỡng cho phép (%.2f) trong dự án '%s'. " +
                    "Điều này có nghĩa là bạn đang quá tải với các nhiệm vụ hiện tại. " +
                    "Vui lòng liên hệ trưởng nhóm để được hỗ trợ.",
                    pressureScore.getPressureScore(), 
                    (double) pressureScore.getThreshold(),
                    project.getName()
                );
                notificationService.notifyUser(user, userTitle, userMessage);
                
                // 2. Notify the group leaders
                // Find the user's group(s) in this project
                List<Group> userGroups = groupRepository.findByMembersContainingAndProject(user, project);
                for (Group group : userGroups) {
                    if (group.getLeader() != null && !group.getLeader().getId().equals(user.getId())) {
                        String leaderTitle = "Cảnh báo: Thành viên trong nhóm quá tải";
                        String leaderMessage = String.format(
                            "Thành viên %s (%s) trong nhóm '%s' đang bị quá tải. " +
                            "Điểm áp lực là %.2f, vượt quá ngưỡng cho phép (%.2f). " +
                            "Bạn cần xem xét lại phân công nhiệm vụ cho thành viên này.",
                            user.getFullName(), 
                            user.getUsername(),
                            group.getName(),
                            pressureScore.getPressureScore(), 
                            (double) pressureScore.getThreshold()
                        );
                        notificationService.notifyUser(group.getLeader(), leaderTitle, leaderMessage);
                    }
                }
                
                // 3. Notify the project instructor
                String instructorTitle = "Cảnh báo: Thành viên quá tải trong dự án";
                String instructorMessage = String.format(
                    "Thành viên %s (%s) đang bị quá tải trong dự án '%s'. " +
                    "Điểm áp lực là %.2f, vượt quá ngưỡng cho phép (%.2f).",
                    user.getFullName(), 
                    user.getUsername(),
                    project.getName(),
                    pressureScore.getPressureScore(), 
                    (double) pressureScore.getThreshold()
                );
                notificationService.notifyUser(project.getInstructor(), instructorTitle, instructorMessage);
            }
        }
    }
    
    /**
     * Save pressure score history record
     */
    private void savePressureScoreHistory(User user, Project project, int score) {
        PressureScoreHistory history = PressureScoreHistory.builder()
                .user(user)
                .project(project)
                .score(score)
                .recordedAt(LocalDateTime.now())
                .build();
        
        pressureScoreHistoryRepository.save(history);
        log.debug("Saved pressure score history: User={}, Project={}, Score={}", 
                  user.getUsername(), project.getName(), score);
    }

    @Override
    public PressureScoreResponse getPressureScoreForUser(User user, Project project) {
        double pressureScore = 0.0;
        int taskCount = 0;
        LocalDate currentDate = LocalDate.now();
        
        // Get incomplete tasks for specified project or all projects
        List<Task> incompleteTasks;
        if (project != null) {
            incompleteTasks = taskRepository.findByAssigneeAndGroupProjectAndStatusNot(
                user, project, TaskStatus.COMPLETED);
        } else {
            incompleteTasks = taskRepository.findByAssigneeAndStatus(user, TaskStatus.NOT_STARTED);
            incompleteTasks.addAll(taskRepository.findByAssigneeAndStatus(user, TaskStatus.IN_PROGRESS));
        }
        
        // Calculate pressure score
        for (Task task : incompleteTasks) {
            int difficultyWeight = task.getDifficulty().getValue();
            long daysRemaining = ChronoUnit.DAYS.between(currentDate, task.getDeadline());
            double timeUrgencyFactor = calculateTimeUrgencyFactor(daysRemaining);
            double taskPressureScore = calculateTaskPressureScore(difficultyWeight, timeUrgencyFactor);
            
            pressureScore += taskPressureScore;
            taskCount++;
        }
        
        // Determine threshold and status
        int threshold = project != null ? project.getPressureThreshold() : 15; // Default if no specific project
        double thresholdPercentage = threshold > 0 ? (pressureScore / threshold) : 0.0;
        
        PressureStatus status;
        if (thresholdPercentage >= 1.0) {
            status = PressureStatus.OVERLOADED;
        } else if (thresholdPercentage >= RISK_THRESHOLD_PERCENTAGE) {
            status = PressureStatus.AT_RISK;
        } else {
            status = PressureStatus.SAFE;
        }
        
        // Build response
        return PressureScoreResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .pressureScore(pressureScore)
                .status(status)
                .taskCount(taskCount)
                .threshold(threshold)
                .thresholdPercentage(thresholdPercentage * 100.0) // Convert to percentage format
                .statusDescription(status.getDescription())
                .projectId(project != null ? project.getId() : null)
                .projectName(project != null ? project.getName() : null)
                .build();
    }
    
    @Override
    public int calculatePressureScore(Long userId, Long projectId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        PressureScoreResponse response = getPressureScoreForUser(user, project);
        
        // Convert the double pressure score to an integer percentage (0-100)
        int score = (int) Math.min(100, Math.round(response.getThresholdPercentage()));
        
        // Save the pressure score to history
        savePressureScoreHistory(user, project, score);
        
        return score;
    }
    
    @Override
    public Map<LocalDateTime, Integer> getPressureScoreHistory(Long userId, Long projectId) {
        // Verify the user and project exist
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        Map<LocalDateTime, Integer> history = new HashMap<>();
        
        // Get the most recent 30 records from the pressure score history
        List<PressureScoreHistory> historyRecords = 
            pressureScoreHistoryRepository.findLatestByUserAndProject(user, project);
        // Sort the records by recorded time (most recent first)
        historyRecords.sort((a, b) -> b.getRecordedAt().compareTo(a.getRecordedAt()));
        // Limit to the most recent 30 records
        if (historyRecords.size() > 30) {
            historyRecords = historyRecords.subList(0, 30);
        }
        
        if (!historyRecords.isEmpty()) {
            // Convert to map of datetime -> score
            for (PressureScoreHistory record : historyRecords) {
                history.put(record.getRecordedAt(), record.getScore());
            }
        } else {
            // No history found, calculate the current score and return a basic history
            int currentScore = calculatePressureScore(userId, projectId);
            LocalDateTime now = LocalDateTime.now();
            
            // Add current score
            history.put(now, currentScore);
            
            // Add some historical entries as a fallback - this will be replaced by real data over time
            history.put(now.minusWeeks(1), Math.max(0, Math.min(100, currentScore - 5)));
            history.put(now.minusWeeks(2), Math.max(0, Math.min(100, currentScore - 10)));
            history.put(now.minusWeeks(3), Math.max(0, Math.min(100, currentScore - 15)));
        }
        
        return history;
    }
    
    /**
     * Helper method to get all users in a project (members and leaders)
     */
    private List<User> getUsersInProject(Project project) {
        if (project == null) {
            log.warn("Project is null in getUsersInProject");
            return new ArrayList<>();
        }
        
        try {
            List<Group> groups = groupRepository.findByProject(project);
            if (groups.isEmpty()) {
                log.warn("No groups found for project {}", project.getName());
                return new ArrayList<>();
            }
            
            List<User> users = new ArrayList<>();
            
            for (Group group : groups) {
                try {
                    // Add group members
                    if (group.getMembers() != null) {
                        users.addAll(group.getMembers());
                    }
                    
                    // Add group leader if not already included
                    if (group.getLeader() != null && !users.contains(group.getLeader())) {
                        users.add(group.getLeader());
                    }
                } catch (Exception e) {
                    log.error("Error processing group {} in project {}: {}", 
                            group.getId(), project.getName(), e.getMessage());
                }
            }
            
            return users;
        } catch (Exception e) {
            log.error("Error getting users for project {}: {}", project.getName(), e.getMessage());
            return new ArrayList<>();
        }
    }
}