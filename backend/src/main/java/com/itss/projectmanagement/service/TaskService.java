package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.request.task.TaskCreateRequest;
import com.itss.projectmanagement.dto.response.task.TaskResponse;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.enums.TaskStatus;

import java.util.List;

public interface TaskService {
    
    TaskResponse createTask(TaskCreateRequest request);
    
    TaskResponse updateTask(Long taskId, TaskCreateRequest request);
    
    TaskResponse getTaskById(Long taskId);
    
    List<TaskResponse> getTasksByGroup(Long groupId);
    
    List<TaskResponse> getTasksByAssignee(Long assigneeId);
    
    void deleteTask(Long taskId);
    
    TaskResponse assignTask(Long taskId, Long assigneeId);
    
    TaskResponse updateTaskStatus(Long taskId, TaskStatus status, Integer completionPercentage);
    
    // Method to calculate Pressure Score
    double calculatePressureScore(Long userId);
}