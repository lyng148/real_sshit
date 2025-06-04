package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.response.pressure.PressureScoreResponse;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.enums.Role;
import com.itss.projectmanagement.exception.ForbiddenException;
import com.itss.projectmanagement.service.IPressureScoreService;
import com.itss.projectmanagement.service.IGroupService;
import com.itss.projectmanagement.service.IUserService;
import com.itss.projectmanagement.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
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
    private final IUserService userService;
    private final IGroupService groupService;

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN', 'STUDENT')")
    @Operation(summary = "Get pressure score for a specific user", 
               description = "Returns the latest calculated pressure score for a user. Students can only see their own scores.")
    public ResponseEntity<ApiResponse<PressureScoreResponse>> getPressureScore(@PathVariable Long userId) {
        
        PressureScoreResponse pressureScore = pressureScoreService.evaluatePressureStatus(userId);
        
        ApiResponse<PressureScoreResponse> response = ApiResponse.success(
                pressureScore,
                "Pressure score retrieved successfully"
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/projects/{projectId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN', 'STUDENT')")
    @Operation(summary = "Get pressure scores for all users in a project", 
               description = "Returns pressure scores for all users in a project. Accessible by instructors, admins, and group leaders of the project.")
    public ResponseEntity<ApiResponse<List<PressureScoreResponse>>> getProjectPressureScores(
            @Parameter(description = "ID of the project") @PathVariable Long projectId) {
        
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
    }

    @GetMapping("/groups/{groupId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN', 'STUDENT')")
    @Operation(summary = "Get all pressure scores for a group", 
               description = "Returns the latest calculated pressure scores for all users in a group. Student can only see scores of his group.")
    public ResponseEntity<ApiResponse<List<PressureScoreResponse>>> getGroupPressureScores(@PathVariable Long groupId) {
        
        // Validate group existence and access
        Group group = groupService.getGroupEntityById(groupId);
        
        // Check permissions
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userService.getUserEntityById(currentUserId);
        
        boolean hasAccess = false;
        
        // Admin and instructors have access to all groups
        if (currentUser.getRoles().contains(Role.ADMIN) || currentUser.getRoles().contains(Role.INSTRUCTOR)) {
            hasAccess = true;
        }
        // Students can only see their own group's scores
        else if (currentUser.getRoles().contains(Role.STUDENT)) {
            // Check if the current user belongs to this group
            hasAccess = group.getMembers().stream()
                    .anyMatch(member -> member.getId().equals(currentUserId));
        }
        
        if (!hasAccess) {
            throw new ForbiddenException("You don't have permission to view this group's pressure scores");
        }
        
        // Get all group members
        Set<User> groupMembers = group.getMembers();
        List<PressureScoreResponse> scores = new ArrayList<>();
        
        for (User member : groupMembers) {
            PressureScoreResponse score = pressureScoreService.evaluatePressureStatus(member.getId());
            scores.add(score);
        }
        
        // Add metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("groupId", groupId);
        metadata.put("groupName", group.getName());
        metadata.put("memberCount", scores.size());
        
        ApiResponse<List<PressureScoreResponse>> response = ApiResponse.success(
                scores,
                "Group pressure scores retrieved successfully",
                metadata
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get pressure score for current logged-in user", 
               description = "Returns the pressure score for the currently authenticated user")
    public ResponseEntity<ApiResponse<PressureScoreResponse>> getCurrentUserPressureScore(
            @AuthenticationPrincipal User currentUser) {
        
        if (currentUser == null) {
            throw new ForbiddenException("User not authenticated");
        }
        
        PressureScoreResponse pressureScore = pressureScoreService.evaluatePressureStatus(currentUser.getId());
        
        ApiResponse<PressureScoreResponse> response = ApiResponse.success(
                pressureScore,
                "Current user pressure score retrieved successfully"
        );
        
        return ResponseEntity.ok(response);
    }
}