package com.itss.projectmanagement.dto.request.task;

import com.itss.projectmanagement.enums.DifficultyLevel;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCreateRequest {
    
    @NotBlank(message = "Task title is required")
    @Size(max = 100, message = "Task title cannot exceed 100 characters")
    private String title;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficulty;
    
    @NotNull(message = "Deadline is required")
    @FutureOrPresent(message = "Deadline must be today or in the future")
    private LocalDate deadline;
    
    private Long assigneeId;
    
    @NotNull(message = "Group ID is required")
    private Long groupId;
}