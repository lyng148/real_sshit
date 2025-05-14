package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.request.task.TaskCreateRequest;
import com.itss.projectmanagement.dto.response.task.TaskResponse;
import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.service.ITaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Task Management", description = "APIs for managing tasks")
public class TaskController {

    private final ITaskService taskService;

    @Operation(summary = "Create a new task", description = "Creates a new task for a group")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Task created successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = TaskResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to create tasks")
    })
    @PostMapping
    @PreAuthorize("hasAuthority('INSTRUCTOR') or @groupSecurityService.isGroupLeader(authentication.principal, #request.groupId)")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody TaskCreateRequest request) {
        try {
            TaskResponse createdTask = taskService.createTask(request);
            
            ApiResponse<TaskResponse> response = ApiResponse.success(
                    createdTask,
                    "Task created successfully"
            );
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            ApiResponse<TaskResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST
            );
            
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(summary = "Update a task", description = "Updates an existing task")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Task updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to update tasks"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Task not found")
    })
    @PutMapping("/{taskId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or @taskSecurityService.isTaskGroupLeader(authentication.principal, #taskId)")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @Parameter(description = "ID of the task to update") @PathVariable Long taskId,
            @Valid @RequestBody TaskCreateRequest request) {
        try {
            TaskResponse updatedTask = taskService.updateTask(taskId, request);
            
            ApiResponse<TaskResponse> response = ApiResponse.success(
                    updatedTask,
                    "Task updated successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            HttpStatus status = HttpStatus.BAD_REQUEST;
            if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            }
            
            ApiResponse<TaskResponse> response = ApiResponse.error(
                    e.getMessage(),
                    status
            );
            
            return new ResponseEntity<>(response, status);
        }
    }

    @Operation(summary = "Get task by ID", description = "Retrieves a task by its ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved task"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Task not found")
    })
    @GetMapping("/{taskId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @Parameter(description = "ID of the task to retrieve") @PathVariable Long taskId) {
        try {
            TaskResponse task = taskService.getTaskById(taskId);
            
            ApiResponse<TaskResponse> response = ApiResponse.success(
                    task,
                    "Task retrieved successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<TaskResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Get tasks by group", description = "Retrieves all tasks for a specific group")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved tasks"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Group not found")
    })
    @GetMapping("/group/{groupId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByGroup(
            @Parameter(description = "ID of the group") @PathVariable Long groupId) {
        try {
            List<TaskResponse> tasks = taskService.getTasksByGroup(groupId);
            
            // Add metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("count", tasks.size());
            
            ApiResponse<List<TaskResponse>> response = ApiResponse.success(
                    tasks,
                    "Tasks retrieved successfully",
                    metadata
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<List<TaskResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Get tasks by assignee", description = "Retrieves all tasks assigned to a specific user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved tasks"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/assignee/{assigneeId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByAssignee(
            @Parameter(description = "ID of the assignee") @PathVariable Long assigneeId) {
        try {
            List<TaskResponse> tasks = taskService.getTasksByAssignee(assigneeId);
            
            // Add metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("count", tasks.size());
            
            ApiResponse<List<TaskResponse>> response = ApiResponse.success(
                    tasks,
                    "Tasks retrieved successfully",
                    metadata
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<List<TaskResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Delete task", description = "Deletes an existing task")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Task deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to delete tasks"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Task not found")
    })
    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or @taskSecurityService.isTaskGroupLeader(authentication.principal, #taskId)")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @Parameter(description = "ID of the task to delete") @PathVariable Long taskId) {
        try {
            taskService.deleteTask(taskId);
            
            ApiResponse<Void> response = ApiResponse.success(
                    null,
                    "Task deleted successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Void> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Assign task to a user", description = "Assigns a task to a specific user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Task assigned successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid assignment request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to assign tasks"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Task or user not found")
    })
    @PutMapping("/{taskId}/assign/{assigneeId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or @taskSecurityService.isTaskGroupLeader(authentication.principal, #taskId)")
    public ResponseEntity<ApiResponse<TaskResponse>> assignTask(
            @Parameter(description = "ID of the task to assign") @PathVariable Long taskId,
            @Parameter(description = "ID of the user to assign the task to") @PathVariable Long assigneeId) {
        try {
            TaskResponse updatedTask = taskService.assignTask(taskId, assigneeId);
            
            ApiResponse<TaskResponse> response = ApiResponse.success(
                    updatedTask,
                    "Task assigned successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            HttpStatus status = HttpStatus.BAD_REQUEST;
            if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            }
            
            ApiResponse<TaskResponse> response = ApiResponse.error(
                    e.getMessage(),
                    status
            );
            
            return new ResponseEntity<>(response, status);
        }
    }

    @Operation(summary = "Update task status", description = "Updates the status of a task")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Task status updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid status update"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Task not found")
    })
    @PutMapping("/{taskId}/status")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @Parameter(description = "ID of the task to update") @PathVariable Long taskId,
            @Parameter(description = "New status of the task") @RequestParam TaskStatus taskStatus) {
        try {
            TaskResponse updatedTask = taskService.updateTaskStatus(taskId, taskStatus);
            
            ApiResponse<TaskResponse> response = ApiResponse.success(
                    updatedTask,
                    "Task status updated successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            HttpStatus status = HttpStatus.BAD_REQUEST;
            if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            }
            
            ApiResponse<TaskResponse> response = ApiResponse.error(
                    e.getMessage(),
                    status
            );
            
            return new ResponseEntity<>(response, status);
        }
    }

    @Operation(summary = "Get pressure score for a user", description = "Calculates and returns the pressure score for a specific user")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved pressure score"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/pressure-score/{userId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or @groupSecurityService.isLeaderOfUserGroup(authentication.principal, #userId)")
    public ResponseEntity<ApiResponse<Double>> getPressureScore(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        try {
            Double pressureScore = taskService.calculatePressureScore(userId);
            
            ApiResponse<Double> response = ApiResponse.success(
                    pressureScore,
                    "Pressure score retrieved successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Double> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}