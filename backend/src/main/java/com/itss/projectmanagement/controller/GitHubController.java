package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.response.github.CommitRecordDTO;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.service.IGitHubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@Tag(name = "GitHub Integration", description = "Endpoints for GitHub integration and commit management")
public class GitHubController {    private final IGitHubService gitHubService;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;

    @PostMapping("/fetch-commits/project/{projectId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @Operation(summary = "Manually fetch commits for all groups in a project", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> fetchCommitsForProject(@PathVariable Long projectId) {
        return projectRepository.findById(projectId)
                .map(project -> {
                    int processedCommits = gitHubService.fetchAndProcessCommitsForProject(project);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Processed " + processedCommits + " new commits across all groups",
                            "processedCount", processedCommits
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/token")
    @Operation(summary = "Get GitHub API token for frontend authenticated requests", 
               description = "Returns a token to use when making GitHub API requests from frontend",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> getGitHubToken() {
        // Get GitHub token from environment or properties
        String token = gitHubService.getGitHubToken();
        if (token == null || token.isEmpty()) {
            // If no token is configured, return an empty response
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "No GitHub token configured"
            ));
        }
        
        // Return token for frontend use
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "GitHub token retrieved successfully",
                "token", token
        ));
    }
    
    @PostMapping("/check-repo")
    @Operation(summary = "Check if a GitHub repository exists and is accessible", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> checkRepository(@RequestBody Map<String, String> requestBody) {
        String owner = requestBody.get("owner");
        String repo = requestBody.get("repo");
        String repoUrl = requestBody.get("repoUrl");
        
        if (owner == null || repo == null || repoUrl == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Owner, repo name, and repository URL are required"
            ));
        }
        
        boolean exists = gitHubService.checkRepositoryExists(owner, repo);
        if (exists) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Repository connection successful"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Repository not found or not accessible"
            ));
        }
    }
    
    @PostMapping("/fetch-commits/group/{groupId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or @securityService.isProjectGroupLeader(authentication.principal.id, #groupId)")
    @Operation(summary = "Manually fetch commits for a specific group", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<?> fetchCommitsForGroup(@PathVariable Long groupId) {
        return groupRepository.findById(groupId)
                .map(group -> {
                    int processedCommits = gitHubService.fetchAndProcessCommits(group);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Processed " + processedCommits + " new commits",
                            "processedCount", processedCommits
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/commits/project/{projectId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Get all commits for a project", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CommitRecordDTO>> getCommitsByProject(@PathVariable Long projectId) {
        return projectRepository.findById(projectId)
                .map(project -> ResponseEntity.ok(gitHubService.getCommitsByProject(project)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/commits/group/{groupId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN') or @securityService.isGroupMember(authentication.principal.id, #groupId)")
    @Operation(summary = "Get all commits for a group", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CommitRecordDTO>> getCommitsByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(gitHubService.getCommitsByGroup(groupId));
    }

    @GetMapping("/commits/invalid/project/{projectId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @Operation(summary = "Get all invalid commits for a project", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CommitRecordDTO>> getInvalidCommitsByProject(@PathVariable Long projectId) {
        return projectRepository.findById(projectId)
                .map(project -> ResponseEntity.ok(gitHubService.getInvalidCommitsByProject(project)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/commits/invalid/group/{groupId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN') or @securityService.isProjectGroupLeader(authentication.principal.id, #groupId)")
    @Operation(summary = "Get all invalid commits for a group", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CommitRecordDTO>> getInvalidCommitsByGroup(@PathVariable Long groupId) {
        return groupRepository.findById(groupId)
                .map(group -> ResponseEntity.ok(gitHubService.getInvalidCommitsByGroup(group)))
                .orElse(ResponseEntity.notFound().build());
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
}