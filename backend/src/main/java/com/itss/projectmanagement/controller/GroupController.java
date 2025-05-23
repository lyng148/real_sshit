package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.request.group.GroupAutoAssignRequest;
import com.itss.projectmanagement.dto.request.group.GroupCreateRequest;
import com.itss.projectmanagement.dto.request.group.GroupJoinRequest;
import com.itss.projectmanagement.dto.request.group.GroupUpdateRequest;
import com.itss.projectmanagement.dto.response.group.GroupDTO;
import com.itss.projectmanagement.service.IGroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@Tag(name = "Group Management", description = "APIs for managing project groups")
public class GroupController {
    @Autowired
    private IGroupService groupService;

    @Operation(summary = "Create a new group", description = "Creates a new group for a project and assigns the creator as leader")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Group created successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = GroupDTO.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "User already in a group or group name already exists")
    })
    @PostMapping
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<GroupDTO>> createGroup(@Valid @RequestBody GroupCreateRequest request) {
        try {
            GroupDTO groupDTO = groupService.createGroup(request);
            ApiResponse<GroupDTO> response = ApiResponse.success(
                    groupDTO,
                    "Group created successfully"
            );
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST
            );
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.CONFLICT
            );
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }
    }
    
    @Operation(summary = "Join an existing group", description = "Adds the current user to an existing group")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Joined group successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Group or project not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "User already in a group or group is full")
    })
    @PostMapping("/join")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<GroupDTO>> joinGroup(@Valid @RequestBody GroupJoinRequest request) {
        try {
            GroupDTO groupDTO = groupService.joinGroup(request.getGroupId(), request.getProjectId());
            ApiResponse<GroupDTO> response = ApiResponse.success(
                    groupDTO,
                    "Joined group successfully"
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST
            );
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.CONFLICT
            );
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }
    }
    
    @Operation(summary = "Auto-assign to a group", description = "Automatically assigns the current user to a group with the fewest members or creates a new group")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Auto-assigned to group successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "User already in a group")
    })
    @PostMapping("/auto-assign")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<GroupDTO>> autoAssignGroup(@Valid @RequestBody GroupAutoAssignRequest request) {
        try {
            GroupDTO groupDTO = groupService.autoAssignGroup(request.getProjectId());
            ApiResponse<GroupDTO> response = ApiResponse.success(
                    groupDTO,
                    "Auto-assigned to group successfully"
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST
            );
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.CONFLICT
            );
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }
    }
    
    @Operation(summary = "Get all groups for a project", description = "Retrieves all groups for a project. Instructors and admins can see all groups, students can only see their own groups.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved groups"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Project not found")
    })
    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<GroupDTO>>> getProjectGroups(
            @Parameter(description = "ID of the project") @PathVariable Long projectId) {
        try {
            List<GroupDTO> groupDTOs = groupService.getProjectGroups(projectId);
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("count", groupDTOs.size());
            ApiResponse<List<GroupDTO>> response = ApiResponse.success(
                    groupDTOs,
                    "Groups retrieved successfully",
                    metadata
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<List<GroupDTO>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
    
    @Operation(summary = "Get group by ID", description = "Retrieves a group by its ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved group"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Group not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to view this group")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<GroupDTO>> getGroupById(
            @Parameter(description = "ID of the group to retrieve") @PathVariable Long id) {
        try {
            GroupDTO groupDTO = groupService.getGroupById(id);
            ApiResponse<GroupDTO> response = ApiResponse.success(
                    groupDTO,
                    "Group retrieved successfully"
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.FORBIDDEN
            );
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }
    }
    
    @Operation(summary = "Leave a group", description = "Removes the current user from a group. Group leaders cannot leave without transferring leadership first.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Left group successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Group not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Cannot leave group (e.g., you are the leader)")
    })
    @PostMapping("/{id}/leave")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            @Parameter(description = "ID of the group to leave") @PathVariable Long id) {
        try {
            groupService.leaveGroup(id);
            ApiResponse<Void> response = ApiResponse.success(
                    null,
                    "Left group successfully"
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Void> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            ApiResponse<Void> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.CONFLICT
            );
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }
    }
    
    @Operation(summary = "Transfer group leadership", description = "Transfers leadership of a group to another member. Only the current group leader can perform this action.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Leadership transferred successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or new leader is not a member"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Group or new leader not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to transfer leadership")
    })
    @PostMapping("/{id}/transfer-leadership/{newLeaderId}")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse<GroupDTO>> transferLeadership(
            @Parameter(description = "ID of the group") @PathVariable Long id,
            @Parameter(description = "ID of the new leader") @PathVariable Long newLeaderId) {
        try {
            GroupDTO groupDTO = groupService.transferLeadership(id, newLeaderId);
            ApiResponse<GroupDTO> response = ApiResponse.success(
                    groupDTO,
                    "Leadership transferred successfully"
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST
            );
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.FORBIDDEN
            );
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }
    }

    @Operation(summary = "Update group information", description = "Updates an existing group's information. Only group leaders and instructors can perform this action.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Group updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Group or new leader not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to update this group")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<GroupDTO>> updateGroup(
            @Parameter(description = "ID of the group to update") @PathVariable Long id,
            @Valid @RequestBody GroupUpdateRequest request) {
        try {
            GroupDTO groupDTO = groupService.updateGroup(id, request);
            ApiResponse<GroupDTO> response = ApiResponse.success(
                    groupDTO,
                    "Group updated successfully"
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.BAD_REQUEST
            );
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            ApiResponse<GroupDTO> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.FORBIDDEN
            );
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }
    }

    @Operation(summary = "Get all groups for the current user", description = "Retrieves all groups that the current authenticated user is a member of")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Groups retrieved successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = GroupDTO.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/my-groups")
    public ResponseEntity<ApiResponse<List<GroupDTO>>> getMyGroups() {
        try {
            List<GroupDTO> groupDTOs = groupService.getCurrentUserGroups();
            ApiResponse<List<GroupDTO>> response = ApiResponse.success(
                    groupDTOs,
                    "User groups retrieved successfully"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<List<GroupDTO>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Get all groups led by current user", description = "Retrieves all groups where the current authenticated user is the leader")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Groups retrieved successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = GroupDTO.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/my-led-groups")
    public ResponseEntity<ApiResponse<List<GroupDTO>>> getMyLedGroups() {
        try {
            List<GroupDTO> groupDTOs = groupService.getGroupsLedByCurrentUser();
            ApiResponse<List<GroupDTO>> response = ApiResponse.success(
                    groupDTOs,
                    "Groups where you are leader retrieved successfully"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<List<GroupDTO>> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Delete group", description = "Deletes an existing group and all its related data (tasks, comments, commit records)")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Group deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to delete this group"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Group not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(
            @Parameter(description = "ID of the group to delete") @PathVariable Long id) {
        try {
            groupService.deleteGroup(id);
            
            ApiResponse<Void> response = ApiResponse.success(
                    null,
                    "Group deleted successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Void> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.NOT_FOUND
            );
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            ApiResponse<Void> response = ApiResponse.error(
                    e.getMessage(),
                    HttpStatus.FORBIDDEN
            );
            
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }
    }
}