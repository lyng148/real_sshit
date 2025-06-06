package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.request.github.RepositoryCheckRequest;
import com.itss.projectmanagement.dto.response.github.CommitRecordDTO;
import com.itss.projectmanagement.exception.GitHubRepositoryException;
import com.itss.projectmanagement.service.IGitHubService;
import com.itss.projectmanagement.service.IGroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@Tag(name = "GitHub Integration", description = "Endpoints for GitHub integration and commit management")
@Validated
public class GitHubController {
    private final IGitHubService gitHubService;
    private final IGroupService groupService;

    @GetMapping("/token")
    @Operation(summary = "Get GitHub API token for frontend authenticated requests", 
               description = "Returns a token to use when making GitHub API requests from frontend",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGitHubToken() {
        String token = gitHubService.getGitHubToken();
        
        Map<String, Object> data;
        String message;
        
        if (token == null || token.isEmpty()) {
            data = Map.of("success", true);
            message = "No GitHub token configured";
        } else {
            data = Map.of(
                    "success", true,
                    "token", token
            );
            message = "GitHub token retrieved successfully";
        }
        
        ApiResponse<Map<String, Object>> response = ApiResponse.success(data, message);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/commits/group/{groupId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN') or @securityService.isGroupMember(#groupId)")
    @Operation(summary = "Get all commits for a group", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<CommitRecordDTO>>> getCommitsByGroup(@PathVariable Long groupId) {
        List<CommitRecordDTO> commits = gitHubService.getCommitsByGroup(groupId);
        
        ApiResponse<List<CommitRecordDTO>> response = ApiResponse.success(
                commits,
                "Commits retrieved successfully",
                Map.of("count", commits.size())
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/commits/task/{taskId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN') or @taskSecurityService.canViewTask(#taskId)")
    @Operation(summary = "Get all commits for a specific task", 
               description = "Returns all commit records associated with a specific task",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<CommitRecordDTO>>> getCommitsByTask(@PathVariable Long taskId) {
        List<CommitRecordDTO> commits = gitHubService.getCommitsByTask(taskId);
        
        ApiResponse<List<CommitRecordDTO>> response = ApiResponse.success(
            commits,
            "Commits retrieved successfully",
            Map.of("count", commits.size())
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check-repository")
    @Operation(summary = "Check GitHub repository connection", 
               description = "Validates if a GitHub repository exists and is accessible",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkRepositoryConnection(
            @Valid @RequestBody RepositoryCheckRequest request) {
        
        // Extract owner and repo from URL
        String repoUrl = request.getRepoUrl();
        String urlPattern = "github\\.com/([^/]+)/([^/]+)";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(urlPattern);
        java.util.regex.Matcher matcher = pattern.matcher(repoUrl);
        
        if (!matcher.find() || matcher.groupCount() < 2) {
            throw new GitHubRepositoryException("Invalid GitHub repository URL format");
        }
        
        String owner = matcher.group(1);
        String repo = matcher.group(2);

        gitHubService.validateRepositoryConnection(owner, repo);
        
        Map<String, Object> data = Map.of(
            "success", true,
            "message", "Repository connection successful"
        );
        
        return ResponseEntity.ok(ApiResponse.success(data, "Repository is accessible"));
    }

    @PostMapping("/sync-commits/group/{groupId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN') or @groupSecurityService.isGroupLeader(#groupId)")
    @Operation(summary = "Manually sync commits for a group", 
               description = "Fetches and processes commits from GitHub repository for a specific group",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncCommitsForGroup(@PathVariable Long groupId) {
        try {
            // Get group DTO first and convert to entity if needed
            var groupDTO = groupService.getGroupById(groupId);
            
            if (groupDTO == null) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Group not found")
                );
            }
            
            // Convert DTO to entity for the service call
            com.itss.projectmanagement.entity.Group group = new com.itss.projectmanagement.entity.Group();
            group.setId(groupDTO.getId());
            group.setName(groupDTO.getName());
            group.setRepositoryUrl(groupDTO.getRepositoryUrl());
            
            int newCommits = gitHubService.fetchAndProcessCommits(group);
            
            Map<String, Object> data = Map.of(
                "success", true,
                "newCommitsProcessed", newCommits,
                "message", String.format("Successfully synced %d new commits", newCommits)
            );
            
            return ResponseEntity.ok(ApiResponse.success(data, "Commits synced successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Failed to sync commits: " + e.getMessage())
            );
        }
    }
}