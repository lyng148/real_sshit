package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.request.contribution.ScoreAdjustmentRequest;
import com.itss.projectmanagement.dto.response.contribution.ContributionScoreResponse;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.enums.Role;
import com.itss.projectmanagement.exception.ForbiddenException;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.ContributionScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contribution-scores")
@RequiredArgsConstructor
@Tag(name = "Contribution Score", description = "Endpoints for managing user contribution scores")
public class ContributionScoreController {

    private final ContributionScoreService contributionScoreService;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;

    @GetMapping("/projects/{projectId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Get all contribution scores for a project", 
               description = "Returns the latest calculated contribution scores for all users in a project. Restricted to instructors and admins.")
    public ResponseEntity<ApiResponse<List<ContributionScoreResponse>>> getScoresByProject(@PathVariable Long projectId) {
        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            
            List<ContributionScoreResponse> scores = contributionScoreService.getScoresByProject(project);
            
            // Add metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("count", scores.size());
            
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.success(
                    scores,
                    "Contribution scores retrieved successfully",
                    metadata
            );
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/projects/{projectId}/users/{userId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Get contribution score for a specific user in a project",
               description = "Returns contribution score for a specific user in a project. Users can only view their own scores unless they are a group leader, instructor, or admin.")
    public ResponseEntity<ApiResponse<ContributionScoreResponse>> getScoreByUserAndProject(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        
        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Check if user has permission to view this score
            if (!hasPermissionToViewScore(currentUser, user, projectId)) {
                throw new ForbiddenException("You don't have permission to view this score");
            }
            
            ContributionScoreResponse score = contributionScoreService.getScoreByUserAndProject(user, project);
            
            ApiResponse<ContributionScoreResponse> response = ApiResponse.success(
                    score,
                    "Contribution score retrieved successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            ApiResponse<ContributionScoreResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (ForbiddenException e) {
            ApiResponse<ContributionScoreResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.FORBIDDEN
            );
            
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            ApiResponse<ContributionScoreResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/groups/{groupId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN', 'STUDENT')")
    @Operation(summary = "Get all contribution scores for a group", 
               description = "Returns the latest calculated contribution scores for all users in a group. Sinh viên chỉ xem được điểm nhóm của mình.")
    public ResponseEntity<ApiResponse<List<ContributionScoreResponse>>> getScoresByGroup(@PathVariable Long groupId, @AuthenticationPrincipal User currentUser) {
        try {
            Group group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
            // Nếu là student, chỉ cho xem điểm nhóm của mình
            if (currentUser.getRoles().contains(Role.STUDENT)) {
                boolean isMember = group.getMembers().contains(currentUser) || (group.getLeader() != null && group.getLeader().getId().equals(currentUser.getId()));
                if (!isMember) {
                    throw new ForbiddenException("Bạn không có quyền xem điểm nhóm này");
                }
            }
            List<ContributionScoreResponse> scores = contributionScoreService.getScoresByGroup(groupId);
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("count", scores.size());
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.success(
                    scores,
                    "Contribution scores for group retrieved successfully",
                    metadata
            );
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (ForbiddenException e) {
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.FORBIDDEN
            );
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/adjust")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Adjust a user's contribution score",
               description = "Allows instructors to adjust a user's contribution score with a reason. Restricted to instructors and admins.")
    public ResponseEntity<ApiResponse<ContributionScoreResponse>> adjustScore(
            @PathVariable Long id,
            @RequestBody ScoreAdjustmentRequest request) {
        
        try {
            ContributionScoreResponse updatedScore = contributionScoreService.adjustScore(
                    id, request.getAdjustedScore(), request.getAdjustmentReason());
            
            ApiResponse<ContributionScoreResponse> response = ApiResponse.success(
                    updatedScore,
                    "Contribution score adjusted successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            ApiResponse<ContributionScoreResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            ApiResponse<ContributionScoreResponse> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/projects/{projectId}/finalize")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Finalize all contribution scores for a project",
               description = "Marks all contribution scores for a project as final. Restricted to instructors and admins.")
    public ResponseEntity<ApiResponse<List<ContributionScoreResponse>>> finalizeScores(@PathVariable Long projectId) {
        try {
            List<ContributionScoreResponse> finalizedScores = contributionScoreService.finalizeScores(projectId);
            
            // Add metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("count", finalizedScores.size());
            
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.success(
                    finalizedScores,
                    "Contribution scores finalized successfully",
                    metadata
            );
            
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            ApiResponse<List<ContributionScoreResponse>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Determines if a user has permission to view another user's contribution score
     * A user can view if:
     * 1. They are viewing their own score
     * 2. They are an instructor or admin
     * 3. They are a group leader of the user's group in the specified project
     */
    private boolean hasPermissionToViewScore(User currentUser, User targetUser, Long projectId) {
        // Case 1: Own score
        if (currentUser.getId().equals(targetUser.getId())) {
            return true;
        }
        
        // Case 2: Instructor or admin
        if (currentUser.getRoles().contains(Role.INSTRUCTOR) || currentUser.getRoles().contains(Role.ADMIN)) {
            return true;
        }
        
        // Case 3: Group leader
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        
        List<Group> projectGroups = groupRepository.findByProject(project);
        for (Group group : projectGroups) {
            // Check if current user is the leader and target user is a member
            if (group.getLeader() != null && 
                group.getLeader().getId().equals(currentUser.getId()) && 
                group.getMembers().contains(targetUser)) {
                return true;
            }
        }
        
        return false;
    }
}