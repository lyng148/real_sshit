package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.converter.UserConverter;
import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.request.project.ProjectAccessRequest;
import com.itss.projectmanagement.dto.request.project.ProjectCreateRequest;
import com.itss.projectmanagement.dto.request.project.ProjectInviteRequest;
import com.itss.projectmanagement.dto.response.project.ProjectDTO;
import com.itss.projectmanagement.dto.response.user.UserDTO;
import com.itss.projectmanagement.dto.response.project.ProjectStatisticsDTO;
import com.itss.projectmanagement.dto.response.report.ProjectReportDTO;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.exception.ForbiddenException;
import com.itss.projectmanagement.exception.NotFoundException;
import com.itss.projectmanagement.service.IProjectService;
import com.itss.projectmanagement.service.IReportService;
import com.itss.projectmanagement.service.IStatisticsService;
import com.itss.projectmanagement.utils.QRCodeGenerator;
import com.itss.projectmanagement.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Project Management", description = "APIs for managing projects")
public class ProjectController {
    private final IProjectService projectService;
    private final UserConverter userConverter;
    private final IReportService reportService;
    private final IStatisticsService statisticsService;
    private final QRCodeGenerator qrCodeGenerator;

    @Operation(summary = "Create a new project", description = "Creates a new project for the current instructor")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Project created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only instructors can create projects")
    })
    @PostMapping
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<ProjectDTO>> createProject(@Valid @RequestBody ProjectCreateRequest request) {
        ProjectDTO createdProject = projectService.createProject(request);

        ApiResponse<ProjectDTO> response = ApiResponse.success(
                createdProject,
                "Project created successfully"
        );
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Get all projects", description = "Retrieves all projects")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved projects")
    })    
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getProjects() {
        List<ProjectDTO> projectDTOs;
        String message;
        
        // Different role-based project access
        if (SecurityUtils.isAdmin()) {
            // Admin can see all projects
            projectDTOs = projectService.getAllProjects();
            message = "All projects retrieved successfully";
        } else if (SecurityUtils.isInstructor()) {
            // Instructors can only see their own projects
            projectDTOs = projectService.getInstructorProjects();
            message = "Instructor projects retrieved successfully";
        } else {
            // Students can only see projects they have access to
            projectDTOs = projectService.getStudentProjects();
            message = "Student accessible projects retrieved successfully";
        }

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
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<ProjectDTO>> getProjectById(
            @Parameter(description = "ID of the project to retrieve") @PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(project -> {
                    ApiResponse<ProjectDTO> response = ApiResponse.success(
                            project,
                            "Project retrieved successfully"
                    );
                    return ResponseEntity.ok(response);
                })
                .orElseThrow(() -> new NotFoundException("Project not found with id: " + id));
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
        ProjectDTO projectDTO = projectService.updateProject(id, request);

        ApiResponse<ProjectDTO> response = ApiResponse.success(
                projectDTO,
                "Project updated successfully"
        );
        
        return ResponseEntity.ok(response);
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
        projectService.deleteProject(id);
        
        ApiResponse<Void> response = ApiResponse.success(
                null,
                "Project deleted successfully"
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get project detailed report", description = "Retrieves detailed project report for instructor evaluation")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved project report"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @GetMapping("/{id}/report")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<ProjectReportDTO>> getProjectReport(
            @Parameter(description = "ID of the project") @PathVariable Long id) {
        ProjectReportDTO reportData = reportService.getProjectReport(id);
        
        ApiResponse<ProjectReportDTO> response = ApiResponse.success(
                reportData,
                "Project detailed report retrieved successfully"
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get project statistics", description = "Retrieves detailed statistics for a project")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved project statistics"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('STUDENT') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<ProjectStatisticsDTO>> getProjectStatistics(
            @Parameter(description = "ID of the project") @PathVariable Long id) {
        // Check if project exists
        Optional<ProjectDTO> project = projectService.getProjectById(id);
        if (project.isEmpty()) {
            throw new NotFoundException("Project not found with id: " + id);
        }

        // Check if the student is a leader of any group in this project
        if (SecurityUtils.isStudent() && !projectService.isUserGroupLeaderInProject(id)) {
            throw new ForbiddenException("Only group leaders or instructors can access project statistics");
        }
        
        ProjectStatisticsDTO statistics = statisticsService.getProjectStatistics(id);
        
        ApiResponse<ProjectStatisticsDTO> response = ApiResponse.success(
                statistics,
                "Project statistics retrieved successfully"
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Join project by access code", description = "Students can join a project using its access code")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully joined project"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid access code"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only students can use access codes")
    })
    @PostMapping("/join")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<ProjectDTO>> joinProjectByAccessCode(@Valid @RequestBody ProjectAccessRequest request) {
        ProjectDTO projectDTO = projectService.joinProjectByAccessCode(request.getAccessCode());

        ApiResponse<ProjectDTO> response = ApiResponse.success(
                projectDTO,
                "Successfully joined project"
        );
        
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Invite students to project", description = "Instructors can invite students to their projects by username")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Students successfully invited"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only project instructor or admin can invite students"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @PostMapping("/{id}/invite")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> inviteStudentsToProject(
            @Parameter(description = "ID of the project", required = true) @PathVariable Long id,
            @Valid @RequestBody ProjectInviteRequest request) {
        // Override the project ID from the path
        request.setProjectId(id);
        
        List<User> invitedStudents = projectService.inviteStudentsToProject(id, request.getUsernames());
        List<String> invitedUsernames = invitedStudents.stream()
                .map(User::getUsername)
                .collect(Collectors.toList());
        
        ApiResponse<List<String>> response = ApiResponse.success(
                invitedUsernames,
                "Students successfully invited to project"
        );
        
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Remove student from project", description = "Instructors can remove students from their projects")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Student successfully removed from project"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only project instructor or admin can remove students"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project or student not found")
    })
    @DeleteMapping("/{projectId}/students/{studentId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeStudentFromProject(
            @Parameter(description = "ID of the project") @PathVariable Long projectId,
            @Parameter(description = "ID of the student to remove") @PathVariable Long studentId) {
        projectService.removeStudentFromProject(projectId, studentId);
        
        ApiResponse<Void> response = ApiResponse.success(
                null,
                "Student successfully removed from project"
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get QR code for project access", description = "Generates a QR code containing the project access code")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "QR code generated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only instructors or admins can access project QR codes"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @GetMapping(value = "/{id}/qrcode", produces = "image/png")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")
    public ResponseEntity<byte[]> getProjectQRCode(
            @Parameter(description = "ID of the project") @PathVariable Long id) {
        // Get the project
        ProjectDTO project = projectService.getProjectById(id)
                .orElseThrow(() -> new NotFoundException("Project not found with id: " + id));
        
        // Check if the current user has access to this project
        if (!SecurityUtils.isAdmin() && !project.getInstructor().getId().equals(SecurityUtils.getCurrentUser().getId())) {
            throw new ForbiddenException("You don't have permission to access this project's QR code");
        }
        
        // Generate QR code
        byte[] qrCodeImage = qrCodeGenerator.generateProjectAccessQRCode(project.getName(), project.getAccessCode());
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=project-" + id + "-qrcode.png")
                .body(qrCodeImage);
    }
    
    @Operation(summary = "Get project access code", description = "Gets the access code for a project")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Access code retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only instructors or admins can access project codes"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @GetMapping("/{id}/access-code")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> getProjectAccessCode(
            @Parameter(description = "ID of the project") @PathVariable Long id) {
        // Get the project
        ProjectDTO project = projectService.getProjectById(id)
                .orElseThrow(() -> new NotFoundException("Project not found with id: " + id));
        
        // Check if the current user has access to this project
        if (!SecurityUtils.isAdmin() && !project.getInstructor().getId().equals(SecurityUtils.getCurrentUser().getId())) {
            throw new ForbiddenException("You don't have permission to access this project's access code");
        }
        
        ApiResponse<String> response = ApiResponse.success(
                project.getAccessCode(),
                "Project access code retrieved successfully"
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get students in a project", description = "Returns all students invited to a project")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved students"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to view project students"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @GetMapping("/{id}/students")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getProjectStudents(
            @Parameter(description = "ID of the project") @PathVariable Long id) {
        // Get the project
        ProjectDTO project = projectService.getProjectById(id)
                .orElseThrow(() -> new NotFoundException("Project not found with id: " + id));
        
        // Check if the current user has access to this project (either admin or project instructor)
        if (!SecurityUtils.isAdmin() && !project.getInstructor().getId().equals(SecurityUtils.getCurrentUser().getId())) {
            throw new ForbiddenException("You don't have permission to access this project's students");
        }
        
        // Get students
        List<User> students = projectService.getProjectStudents(id);
        List<UserDTO> studentDTOs = students.stream()
                .map(userConverter::toDTO)
                .collect(Collectors.toList());
        
        ApiResponse<List<UserDTO>> response = ApiResponse.success(
                studentDTOs,
                "Project students retrieved successfully"
        );
        
        return ResponseEntity.ok(response);
    }
}