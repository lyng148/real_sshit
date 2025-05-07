package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.dto.response.pressure.PressureScoreResponse;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.enums.PressureStatus;
import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.TaskRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.PressureScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PressureScoreServiceImpl implements PressureScoreService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Get all incomplete tasks assigned to the user
        List<Task> incompleteTasks = taskRepository.findByAssigneeAndStatus(user, TaskStatus.NOT_STARTED);
        incompleteTasks.addAll(taskRepository.findByAssigneeAndStatus(user, TaskStatus.IN_PROGRESS));
        
        double totalPressureScore = 0.0;
        LocalDate currentDate = LocalDate.now();
        
        for (Task task : incompleteTasks) {
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
        }
        
        log.info("User {}: Total Member Pressure Score = {}, Task count = {}",
                user.getUsername(), totalPressureScore, incompleteTasks.size());
        
        return totalPressureScore;
    }

    @Override
    public PressureScoreResponse evaluatePressureStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
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
            userProjects.put(group.getProject().getId(), group.getProject());
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
            Long projectId = task.getGroup().getProject().getId();
            tasksByProject.computeIfAbsent(projectId, k -> new ArrayList<>()).add(task);
        }
        
        // Calculate pressure score for each project
        for (Map.Entry<Long, List<Task>> entry : tasksByProject.entrySet()) {
            Long projectId = entry.getKey();
            List<Task> projectTasks = entry.getValue();
            Project project = userProjects.get(projectId);
            
            if (project == null) {
                continue;
            }
            
            double projectPressureScore = 0.0;
            LocalDate currentDate = LocalDate.now();
            
            for (Task task : projectTasks) {
                int difficultyWeight = task.getDifficulty().getValue();
                long daysRemaining = ChronoUnit.DAYS.between(currentDate, task.getDeadline());
                double timeUrgencyFactor = calculateTimeUrgencyFactor(daysRemaining);
                double taskPressureScore = calculateTaskPressureScore(difficultyWeight, timeUrgencyFactor);
                
                projectPressureScore += taskPressureScore;
            }
            
            totalTaskCount += projectTasks.size();
            
            // Calculate what percentage of the threshold this score represents
            double thresholdPercentage = projectPressureScore / project.getPressureThreshold();
            
            if (thresholdPercentage > highestThresholdPercentage) {
                highestThresholdPercentage = thresholdPercentage;
                highestPressureScore = projectPressureScore;
                highestPressureProject = project;
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
    }

    @Override
    @Transactional(readOnly = true)
    public List<PressureScoreResponse> getProjectPressureScores(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        // Get all users in this project
        List<User> projectUsers = getUsersInProject(project);
        
        log.info("Getting pressure scores for {} users in project {}", projectUsers.size(), project.getName());
        
        return projectUsers.stream()
                .map(user -> getPressureScoreForUser(user, project))
                .collect(Collectors.toList());
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
            
            // If pressure score is OVERLOADED, we could add notification logic here
            if (pressureScore.getStatus() == PressureStatus.OVERLOADED) {
                log.warn("User {} is OVERLOADED with pressure score {} in project {}", 
                    user.getUsername(), pressureScore.getPressureScore(), project.getName());
                
                // TODO: Add notification to user/group leader/instructor if needed
            }
        }
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
        Integer threshold = project != null ? project.getPressureThreshold() : 15; // Default if no specific project
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
    
    /**
     * Helper method to get all users in a project (members and leaders)
     */
    private List<User> getUsersInProject(Project project) {
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