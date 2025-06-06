package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.converter.TaskConverter;
import com.itss.projectmanagement.dto.request.task.TaskCreateRequest;
import com.itss.projectmanagement.dto.response.task.TaskResponse;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.TaskRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.INotificationService;
import com.itss.projectmanagement.service.ITaskService;
import com.itss.projectmanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements ITaskService {

    private final TaskRepository taskRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final TaskConverter taskConverter;
    private final INotificationService notificationService;

    @Override
    @Transactional
    public TaskResponse createTask(TaskCreateRequest request) {
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        User assignee = null;
        String pressureWarning = null;
        
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getAssigneeId()));
            
            // Check if user is in the group
            if (!group.getMembers().contains(assignee)) {
                throw new IllegalArgumentException("Assignee is not a member of the group");
            }
            
            // Calculate pressure score for assignee before assigning the task
            double pressureScore = calculatePressureScore(assignee.getId());
            Project project = group.getProject();
            
            // Check if pressure score exceeds threshold
            if (pressureScore >= project.getPressureThreshold()) {
                // Set warning message to be included in response
                pressureWarning = "WARNING: Assigning task to user with high pressure score: " + String.format("%.2f", pressureScore);
                System.out.println(pressureWarning);
            }
        }
        
        Task task = taskConverter.toEntity(request, group, assignee);
        Task savedTask = taskRepository.save(task);
        
        if (assignee != null) {
            String title = "Bạn được giao nhiệm vụ mới";
            String message = "Bạn vừa được giao task: '" + task.getTitle() + "' trong dự án '" + group.getProject().getName() + "'.";
            notificationService.notifyUser(assignee, title, message);
        }
        
        return taskConverter.toResponse(savedTask, pressureWarning);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long taskId, TaskCreateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        
        User assignee = null;
        String pressureWarning = null;
        
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getAssigneeId()));
            
            // Check if user is in the group
            if (!group.getMembers().contains(assignee)) {
                throw new IllegalArgumentException("Assignee is not a member of the group");
            }
        }
          task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDifficulty(request.getDifficulty());
        task.setDeadline(request.getDeadline());
        task.setGroup(group);
        
        // Set priority if provided, otherwise keep existing priority
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        
        // If assignee is changing, recalculate pressure score
        if (assignee != null && (task.getAssignee() == null || !task.getAssignee().getId().equals(assignee.getId()))) {
            double pressureScore = calculatePressureScore(assignee.getId());
            Project project = group.getProject();
            
            // Check if pressure score exceeds threshold
            if (pressureScore >= project.getPressureThreshold()) {
                // Set warning message to be included in response
                pressureWarning = "WARNING: Reassigning task to user with high pressure score: " + String.format("%.2f", pressureScore);
                System.out.println(pressureWarning);
            }
            
            task.setAssignee(assignee);
            String title = "Bạn được giao lại nhiệm vụ";
            String message = "Bạn vừa được giao lại task: '" + task.getTitle() + "' trong dự án '" + group.getProject().getName() + "'.";
            notificationService.notifyUser(assignee, title, message);
        } else if (assignee == null) {
            task.setAssignee(null);
        }
        
        Task updatedTask = taskRepository.save(task);
        return taskConverter.toResponse(updatedTask, pressureWarning);
    }

    @Override
    public TaskResponse getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        return taskConverter.toResponse(task);
    }

    @Override
    public List<TaskResponse> getTasksByGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        
        return taskRepository.findByGroup(group).stream()
                .map(taskConverter::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponse> getTasksByAssignee(Long assigneeId) {
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + assigneeId));
        
        return taskRepository.findByAssignee(assignee).stream()
                .map(taskConverter::toResponse)
                .collect(Collectors.toList());
    }    
    
    @Override
    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        
        // With cascading delete configured, this will automatically delete all comments
        // and remove references from commit records
        taskRepository.delete(task);
    }

    @Override
    @Transactional
    public TaskResponse assignTask(Long taskId, Long assigneeId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + assigneeId));
        
        // Check if user is in the group
        if (!task.getGroup().getMembers().contains(assignee)) {
            throw new IllegalArgumentException("Assignee is not a member of the group");
        }
        
        String pressureWarning = null;
        
        // Calculate pressure score before assigning the task
        double pressureScore = calculatePressureScore(assigneeId);
        Project project = task.getGroup().getProject();
        
        // Check if pressure score exceeds threshold
        if (pressureScore >= project.getPressureThreshold()) {
            // Set warning message to be included in response
            pressureWarning = "WARNING: Assigning task to user with high pressure score: " + String.format("%.2f", pressureScore);
            System.out.println(pressureWarning);
        }
        
        task.setAssignee(assignee);
        Task updatedTask = taskRepository.save(task);
        
        String title = "Bạn được giao nhiệm vụ mới";
        String message = "Bạn vừa được giao task: '" + task.getTitle() + "' trong dự án '" + project.getName() + "'.";
        notificationService.notifyUser(assignee, title, message);
        
        return taskConverter.toResponse(updatedTask, pressureWarning);
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        // check if current user is not the assignee or group leader
        User user = SecurityUtils.getCurrentUser();

        // handle when task don't have assignee
        if (task.getAssignee() == null) {
            throw new IllegalArgumentException("Task has no assignee");
        }

        // Ensure user is authenticated
        if (!task.getAssignee().getId().equals(user.getId()) && !task.getGroup().getLeader().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You do not have permission to update this task's status");
        }

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(status);
        
        // Set completedAt when status changes to COMPLETED
        if (status == TaskStatus.COMPLETED && oldStatus != TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDateTime.now());
        } 
        // Clear completedAt if status changes from COMPLETED to something else
        else if (oldStatus == TaskStatus.COMPLETED && status != TaskStatus.COMPLETED) {
            task.setCompletedAt(null);
        }
        
        Task updatedTask = taskRepository.save(task);
        return taskConverter.toResponse(updatedTask);
    }

    @Override
    public double calculatePressureScore(Long userId) {
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
                    double timeUrgencyFactor;
                    
                    long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(currentDate, task.getDeadline());
                    
                    if (daysRemaining < 0) {
                        // Task is overdue
                        timeUrgencyFactor = 3.5;
                    } else if (daysRemaining <= 1) {
                        // Due today or tomorrow
                        timeUrgencyFactor = 3.0;
                    } else if (daysRemaining <= 3) {
                        // Due within 3 days
                        timeUrgencyFactor = 2.0;
                    } else if (daysRemaining <= 7) {
                        // Due within a week
                        timeUrgencyFactor = 1.5;
                    } else {
                        // More than a week away
                        timeUrgencyFactor = 1.0;
                    }
                    
                    // Step 3: Calculate Task Pressure Score (TPS)
                    double taskPressureScore = difficultyWeight * timeUrgencyFactor;
                    
                    // Add to total
                    totalPressureScore += taskPressureScore;
                } catch (Exception e) {
                    log.error("Error calculating pressure score for task ID {}: {}", task.getId(), e.getMessage());
                    // Continue with other tasks instead of failing completely
                }
            }
            
            return totalPressureScore;
        } catch (Exception e) {
            log.error("Error calculating pressure score for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to calculate pressure score for user: " + userId, e);
        }
    }
}