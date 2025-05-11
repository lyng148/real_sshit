package com.itss.projectmanagement.security;

import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service to handle security checks related to Task entities
 */
@Service
@RequiredArgsConstructor
public class TaskSecurityService {

    private final TaskRepository taskRepository;
    
    /**
     * Check if a user is the leader of the group that a task belongs to
     * 
     * @param user The authenticated user
     * @param taskId The task ID to check
     * @return true if the user is the leader of the group that owns the task, false otherwise
     */
    public boolean isTaskGroupLeader(Object user, Long taskId) {
        if (user == null || taskId == null) {
            return false;
        }

        try {
            User authenticatedUser = (User) user;
            Optional<Task> taskOpt = taskRepository.findById(taskId);
            
            if (taskOpt.isEmpty()) {
                return false;
            }
            
            Task task = taskOpt.get();
            return task.getGroup().getLeader() != null && 
                   task.getGroup().getLeader().getId().equals(authenticatedUser.getId());
        } catch (ClassCastException e) {
            return false;
        }
    }

    /**
     * Check if a user can view a task. This includes:
     * - The user is the group leader
     * - The user is assigned to the task
     * - The user is a member of the group that owns the task
     * 
     * @param user The authenticated user
     * @param taskId The task ID to check
     * @return true if the user can view the task, false otherwise
     */
    public boolean canViewTask(Object user, Long taskId) {
        if (user == null || taskId == null) {
            return false;
        }
        
        try {
            User authenticatedUser = (User) user;
            Optional<Task> taskOpt = taskRepository.findById(taskId);
            
            if (taskOpt.isEmpty()) {
                return false;
            }
            
            Task task = taskOpt.get();
            
            // Check if user is the group leader
            if (task.getGroup().getLeader() != null && 
                task.getGroup().getLeader().getId().equals(authenticatedUser.getId())) {
                return true;
            }
            
            // Check if user is assigned to the task
            if (task.getAssignee() != null && 
                task.getAssignee().getId().equals(authenticatedUser.getId())) {
                return true;
            }
            
            // Check if user is a member of the group
            return task.getGroup().getMembers().stream()
                .anyMatch(member -> member.getId().equals(authenticatedUser.getId()));
                
        } catch (ClassCastException e) {
            return false;
        }
    }
}