package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.response.pressure.PressureScoreResponse;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.exception.ForbiddenException;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.IPressureScoreService;
import com.itss.projectmanagement.service.IProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/pressure-scores")
@RequiredArgsConstructor
@Tag(name = "Pressure Score", description = "APIs for managing pressure scores in the system")
public class PressureScoreController {

    private final IPressureScoreService pressureScoreService;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    private final IProjectService projectService;

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN') or @groupSecurityService.isLeaderOfUserGroup(authentication.principal, #userId) or authentication.principal.id == #userId")
    @Operation(summary = "Get pressure score for a user", 
               description = "Returns the calculated pressure score and status for a specific user. Users can view their own scores, group leaders can view scores of their group members, and instructors/admins can view all scores.")
    public ResponseEntity<ApiResponse<PressureScoreResponse>> getUserPressureScore(
            @Parameter(description = "ID of the user to get pressure score for") @PathVariable Long userId) {
        
        try {
            PressureScoreResponse pressureScore = pressureScoreService.evaluatePressureStatus(userId);
            
            ApiResponse<PressureScoreResponse> response = ApiResponse.success(
                    pressureScore,
                    "Pressure score retrieved successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            ApiResponse<PressureScoreResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            ApiResponse<PressureScoreResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/projects/{projectId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN') or @projectService.isUserGroupLeaderInProject(#projectId)")
    @Operation(summary = "Get pressure scores for all users in a project", 
               description = "Returns pressure scores for all users in a project. Accessible by instructors, admins, and group leaders of the project.")
    public ResponseEntity<ApiResponse<List<PressureScoreResponse>>> getProjectPressureScores(
            @Parameter(description = "ID of the project") @PathVariable Long projectId) {
        
        try {
            List<PressureScoreResponse> pressureScores = pressureScoreService.getProjectPressureScores(projectId);
            
            // Add metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("count", pressureScores.size());
            
            ApiResponse<List<PressureScoreResponse>> response = ApiResponse.success(
                    pressureScores,
                    "Project pressure scores retrieved successfully",
                    metadata
            );
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            ApiResponse<List<PressureScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            ApiResponse<List<PressureScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/groups/{groupId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN') or @groupSecurityService.isGroupLeader(authentication.principal, #groupId)")
    @Operation(summary = "Get pressure scores for all users in a group", 
               description = "Returns pressure scores for all users in a specific group. Accessible by instructors, admins, and the group leader.")
    public ResponseEntity<ApiResponse<List<PressureScoreResponse>>> getGroupPressureScores(
            @Parameter(description = "ID of the group") @PathVariable Long groupId) {
        
        try {
            Group group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));
            
            Project project = group.getProject();
            
            Set<User> groupUsers = group.getMembers();
            if (group.getLeader() != null) {
                groupUsers.add(group.getLeader());
            }
            
            List<PressureScoreResponse> pressureScores = groupUsers.stream()
                    .map(user -> pressureScoreService.getPressureScoreForUser(user, project))
                    .toList();
            
            // Add metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("count", pressureScores.size());
            
            ApiResponse<List<PressureScoreResponse>> response = ApiResponse.success(
                    pressureScores,
                    "Group pressure scores retrieved successfully",
                    metadata
            );
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            ApiResponse<List<PressureScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            ApiResponse<List<PressureScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get pressure score for current logged-in user", 
               description = "Returns the pressure score for the currently authenticated user")
    public ResponseEntity<ApiResponse<PressureScoreResponse>> getCurrentUserPressureScore(
            @AuthenticationPrincipal User currentUser) {
        
        try {
            if (currentUser == null) {
                throw new ForbiddenException("User not authenticated");
            }
            
            PressureScoreResponse pressureScore = pressureScoreService.evaluatePressureStatus(currentUser.getId());
            
            ApiResponse<PressureScoreResponse> response = ApiResponse.success(
                    pressureScore,
                    "Current user pressure score retrieved successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException | ForbiddenException e) {
            HttpStatus status = e instanceof ResourceNotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.FORBIDDEN;
            
            ApiResponse<PressureScoreResponse> response = ApiResponse.error(
                    e.getMessage(),
                    status
            );
            
            return new ResponseEntity<>(response, status);
        } catch (Exception e) {
            ApiResponse<PressureScoreResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}