package com.itss.projectmanagement.dto.response.task;

import com.itss.projectmanagement.enums.DifficultyLevel;
import com.itss.projectmanagement.enums.TaskPriority;
import com.itss.projectmanagement.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private DifficultyLevel difficulty;
    private TaskPriority priority;
    private LocalDate deadline;
    private Long assigneeId;
    private String assigneeName;
    private String assigneeAvatarUrl;
    private Long groupId;
    private String groupName;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private String pressureWarning;
}