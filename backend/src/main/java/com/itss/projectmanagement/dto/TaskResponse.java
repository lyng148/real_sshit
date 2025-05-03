package com.itss.projectmanagement.dto;

import com.itss.projectmanagement.entity.Task.DifficultyLevel;
import com.itss.projectmanagement.entity.Task.TaskStatus;
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
    private LocalDate deadline;
    private Long assigneeId;
    private String assigneeName;
    private Long groupId;
    private String groupName;
    private TaskStatus status;
    private Integer completionPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String pressureWarning;
}