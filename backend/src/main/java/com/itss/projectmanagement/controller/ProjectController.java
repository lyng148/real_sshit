package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.converter.ProjectConverter;
import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.request.project.PressureScoreConfigRequest;
import com.itss.projectmanagement.dto.request.project.ProjectCreateRequest;
import com.itss.projectmanagement.dto.response.project.ProjectDTO;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.service.ProjectService;
import com.itss.projectmanagement.utils.SecurityUtils;
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
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Project Management", description = "APIs for managing projects")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectConverter projectConverter;

    @Operation(summary = "Create a new project", description = "Creates a new project for the current instructor")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Project created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only instructors can create projects")
    })
    @PostMapping
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<ProjectDTO>> createProject(@Valid @RequestBody ProjectCreateRequest request) {
        Project createdProject = projectService.createProject(request);
        ProjectDTO projectDTO = projectConverter.toDTO(createdProject);
        
        ApiResponse<ProjectDTO> response = ApiResponse.success(
                projectDTO, 
                "Project created successfully"
        );
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Get all projects", description = "Retrieves all projects (admin) or instructor's projects")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved projects")
    })
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getProjects() {
        List<Project> projects;
        String message;
        
        // Admin can see all projects, instructors can only see their own
        if (SecurityUtils.isAdmin()) {
            projects = projectService.getAllProjects();
            message = "All projects retrieved successfully";
        } else {
            projects = projectService.getInstructorProjects();
            message = "Instructor projects retrieved successfully";
        }
        
        List<ProjectDTO> projectDTOs = projectConverter.toDTO(projects);
        
        // Add metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("count", projectDTOs.size());
        
        ApiResponse<List<ProjectDTO>> response = ApiResponse.success(
                projectDTOs, 
                message, 
                metadata
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get project by ID", description = "Retrieves a project by its ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved project"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<ProjectDTO>> getProjectById(
            @Parameter(description = "ID of the project to retrieve") @PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(project -> {
                    ProjectDTO projectDTO = projectConverter.toDTO(project);
                    ApiResponse<ProjectDTO> response = ApiResponse.success(
                            projectDTO,
                            "Project retrieved successfully"
                    );
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    ApiResponse<ProjectDTO> response = ApiResponse.error(
                            "Project not found with id: " + id,
                            HttpStatus.NOT_FOUND
                    );
                    return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
                });
    }

    @Operation(summary = "Update project", description = "Updates an existing project")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Project updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to update this project"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<ProjectDTO>> updateProject(
            @Parameter(description = "ID of the project to update") @PathVariable Long id,
            @Valid @RequestBody ProjectCreateRequest request) {
        try {
            Project updatedProject = projectService.updateProject(id, request);
            ProjectDTO projectDTO = projectConverter.toDTO(updatedProject);
            
            ApiResponse<ProjectDTO> response = ApiResponse.success(
                    projectDTO,
                    "Project updated successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            HttpStatus status;
            if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else {
                status = HttpStatus.FORBIDDEN;
            }
            
            ApiResponse<ProjectDTO> response = ApiResponse.error(
                    e.getMessage(),
                    status
            );
            
            return new ResponseEntity<>(response, status);
        }
    }

    @Operation(summary = "Delete project", description = "Deletes an existing project")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Project deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to delete this project"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @Parameter(description = "ID of the project to delete") @PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            
            ApiResponse<Void> response = ApiResponse.success(
                    null,
                    "Project deleted successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            HttpStatus status;
            if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else {
                status = HttpStatus.FORBIDDEN;
            }
            
            ApiResponse<Void> response = ApiResponse.error(
                    e.getMessage(),
                    status
            );
            
            return new ResponseEntity<>(response, status);
        }
    }

    @Operation(summary = "Update pressure score configuration", description = "Updates the pressure score configuration for a project")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Configuration updated successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = ProjectDTO.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to update this project"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @PutMapping("/{id}/pressure-score-config")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<ProjectDTO>> updatePressureScoreConfig(
            @Parameter(description = "ID of the project to update") @PathVariable Long id,
            @Valid @RequestBody PressureScoreConfigRequest request) {
        try {
            Project updatedProject = projectService.updatePressureScoreConfig(id, request);
            ProjectDTO projectDTO = projectConverter.toDTO(updatedProject);
            
            ApiResponse<ProjectDTO> response = ApiResponse.success(
                    projectDTO,
                    "Pressure score configuration updated successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            HttpStatus status;
            if (e.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else {
                status = HttpStatus.FORBIDDEN;
            }
            
            ApiResponse<ProjectDTO> response = ApiResponse.error(
                    e.getMessage(),
                    status
            );
            
            return new ResponseEntity<>(response, status);
        }
    }
}