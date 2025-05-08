package com.itss.projectmanagement.converter;

import com.itss.projectmanagement.dto.request.task.TaskCreateRequest;
import com.itss.projectmanagement.dto.response.task.TaskResponse;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.enums.TaskStatus;
import org.springframework.stereotype.Component;

@Component
public class TaskConverter {
    
    public Task toEntity(TaskCreateRequest request, Group group, User assignee) {
        return Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .difficulty(request.getDifficulty())
                .deadline(request.getDeadline())
                .group(group)
                .assignee(assignee)
                .status(TaskStatus.NOT_STARTED)
                .build();
    }
    
    public TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .difficulty(task.getDifficulty())
                .deadline(task.getDeadline())
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getFullName() : null)
                .groupId(task.getGroup().getId())
                .groupName(task.getGroup().getName())
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .completedAt(task.getCompletedAt())
                .pressureWarning(null) // Default to null, will be set by service if needed
                .build();
    }
    
    public TaskResponse toResponse(Task task, String pressureWarning) {
        TaskResponse response = toResponse(task);
        response.setPressureWarning(pressureWarning);
        return response;
    }
}