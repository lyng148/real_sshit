package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.CommitRecordDTO;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.service.GitHubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@Tag(name = "GitHub Integration", description = "Endpoints for GitHub integration and commit management")
public class GitHubController {

    private final GitHubService gitHubService;
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
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @Operation(summary = "Get all commits for a project", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CommitRecordDTO>> getCommitsByProject(@PathVariable Long projectId) {
        return projectRepository.findById(projectId)
                .map(project -> ResponseEntity.ok(gitHubService.getCommitsByProject(project)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/commits/group/{groupId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or @securityService.isGroupMember(authentication.principal.id, #groupId)")
    @Operation(summary = "Get all commits for a group", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CommitRecordDTO>> getCommitsByGroup(@PathVariable Long groupId) {
        return groupRepository.findById(groupId)
                .map(group -> ResponseEntity.ok(gitHubService.getCommitsByGroup(group)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/commits/invalid/project/{projectId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @Operation(summary = "Get all invalid commits for a project", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CommitRecordDTO>> getInvalidCommitsByProject(@PathVariable Long projectId) {
        return projectRepository.findById(projectId)
                .map(project -> ResponseEntity.ok(gitHubService.getInvalidCommitsByProject(project)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/commits/invalid/group/{groupId}")
    @PreAuthorize("hasAuthority('INSTRUCTOR') or @securityService.isProjectGroupLeader(authentication.principal.id, #groupId)")
    @Operation(summary = "Get all invalid commits for a group", 
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CommitRecordDTO>> getInvalidCommitsByGroup(@PathVariable Long groupId) {
        return groupRepository.findById(groupId)
                .map(group -> ResponseEntity.ok(gitHubService.getInvalidCommitsByGroup(group)))
                .orElse(ResponseEntity.notFound().build());
    }
}