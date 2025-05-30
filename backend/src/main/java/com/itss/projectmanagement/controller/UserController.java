package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.converter.UserConverter;
import com.itss.projectmanagement.dto.common.ApiResponse;
import com.itss.projectmanagement.dto.common.PaginationResponse;
import com.itss.projectmanagement.dto.request.user.RoleAssignmentRequest;
import com.itss.projectmanagement.dto.response.user.RoleAssignmentResponse;
import com.itss.projectmanagement.dto.response.user.UserDTO;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.exception.ForbiddenException;
import com.itss.projectmanagement.exception.NotFoundException;
import com.itss.projectmanagement.utils.SecurityUtils;
import com.itss.projectmanagement.service.IUserService;
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

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    @Autowired
    private IUserService userService;
    @Autowired
    private UserConverter userConverter;

    @Operation(summary = "Get all users", description = "Retrieves a list of all users")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved list of users",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = UserDTO.class)))
    })
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO> userDTOs = userConverter.toDTO(users);
        
        // Add metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("count", userDTOs.size());
        
        ApiResponse<List<UserDTO>> response = ApiResponse.success(
                userDTOs,
                "Users retrieved successfully",
                metadata
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all users with pagination", description = "Retrieves a list of all users with pagination support")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved list of users with pagination",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = UserDTO.class)))
    })
    @GetMapping("/paginated")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<PaginationResponse<UserDTO>>> getAllUsersPaginated(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "fullName") String sortBy,
            @Parameter(description = "Sort direction (ASC or DESC)") @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        PaginationResponse<User> userPaginationResponse = userService.getAllUsersPaginated(page, size, sortBy, sortDirection);
        
        // Convert Users to UserDTOs
        List<UserDTO> userDTOs = userConverter.toDTO(userPaginationResponse.getContent());
        
        // Create new pagination response with DTOs
        PaginationResponse<UserDTO> paginationResponse = PaginationResponse.<UserDTO>builder()
                .content(userDTOs)
                .pagination(userPaginationResponse.getPagination())
                .build();
        
        ApiResponse<PaginationResponse<UserDTO>> response = ApiResponse.success(
                paginationResponse,
                "Users retrieved successfully with pagination"
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get user by ID", description = "Retrieves a user by their ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(
            @Parameter(description = "ID of the user to retrieve") @PathVariable Long id) {
        // Check if the user is the current user
        if (!SecurityUtils.isAdmin() && !SecurityUtils.isCurrentUser(id) && !SecurityUtils.isInstructor()) {
            throw new ForbiddenException("Access denied");
        }

        User user = userService.getUserById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        
        UserDTO userDTO = userConverter.toDTO(user);
        ApiResponse<UserDTO> response = ApiResponse.success(
                userDTO,
                "User retrieved successfully"
        );
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get user by username", description = "Retrieves a user by their username")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(
            @Parameter(description = "Username of the user to retrieve") @PathVariable String username) {
        User user = userService.getUserByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found with username: " + username));
        
        UserDTO userDTO = userConverter.toDTO(user);
        ApiResponse<UserDTO> response = ApiResponse.success(
                userDTO,
                "User retrieved successfully"
        );
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create a new user", description = "Creates a new user in the system")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        UserDTO userDTO = userConverter.toDTO(createdUser);
        
        ApiResponse<UserDTO> response = ApiResponse.success(
                userDTO,
                "User created successfully"
        );
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing user", description = "Updates an existing user's information")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @Parameter(description = "ID of the user to update") @PathVariable Long id,
            @RequestBody User userRequest) {
        // Check if the user is the current user
        if (!SecurityUtils.isAdmin() && !SecurityUtils.isCurrentUser(id)) {
            throw new ForbiddenException("Access denied");
        }

        User existingUser = userService.getUserById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        
        // Only update fields that are provided in the request
        if (userRequest.getUsername() != null) {
            existingUser.setUsername(userRequest.getUsername());
        }
        if (userRequest.getFullName() != null) {
            existingUser.setFullName(userRequest.getFullName());
        }
        if (userRequest.getEmail() != null) {
            existingUser.setEmail(userRequest.getEmail());
        }
        if (userRequest.getRoles() != null) {
            existingUser.setRoles(userRequest.getRoles());
        }
        if (userRequest.getPassword() != null) {
            // Password will be encoded in the service
            existingUser.setPassword(userRequest.getPassword());
        }
        if (userRequest.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(userRequest.getAvatarUrl());
        }
        // Update enabled status if explicitly set in the request
        existingUser.setEnabled(userRequest.isEnabled());
        
        User updatedUser = userService.updateUser(existingUser);
        UserDTO userDTO = userConverter.toDTO(updatedUser);
        
        ApiResponse<UserDTO> response = ApiResponse.success(
                userDTO,
                "User updated successfully"
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete a user", description = "Deletes a user from the system")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "ID of the user to delete") @PathVariable Long id) {
        User user = userService.getUserById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        
        userService.deleteUser(id);
        
        ApiResponse<Void> response = ApiResponse.success(
                null,
                "User deleted successfully"
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Assign roles to a user", description = "Updates the roles assigned to a user. Only admins can perform this operation.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Roles assigned successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input - roles cannot be empty"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - only admins can assign roles"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<RoleAssignmentResponse>> assignRoles(
            @Parameter(description = "ID of the user to update roles") @PathVariable Long id,
            @Valid @RequestBody RoleAssignmentRequest request) {
        
        User existingUser = userService.getUserById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        
        existingUser.setRoles(request.getRoles());
        User updatedUser = userService.updateUser(existingUser);
        
        RoleAssignmentResponse roleResponse = new RoleAssignmentResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getRoles(),
                "Roles assigned successfully"
        );
        
        ApiResponse<RoleAssignmentResponse> response = ApiResponse.success(
                roleResponse,
                "Roles assigned successfully"
        );
        
        return ResponseEntity.ok(response);
    }
}