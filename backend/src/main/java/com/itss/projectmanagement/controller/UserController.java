package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.RoleAssignmentRequest;
import com.itss.projectmanagement.dto.RoleAssignmentResponse;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.security.Role;
import com.itss.projectmanagement.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get all users", description = "Retrieves a list of all users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list of users",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = User.class)))
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Get user by ID", description = "Retrieves a user by their ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR') or @userService.isCurrentUser(#id)")
    public ResponseEntity<User> getUserById(
            @Parameter(description = "ID of the user to retrieve") @PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new user", description = "Creates a new user in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return new ResponseEntity<>(userService.createUser(user), HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing user", description = "Updates an existing user's information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isCurrentUser(#id)")
    public ResponseEntity<User> updateUser(
            @Parameter(description = "ID of the user to update") @PathVariable Long id,
            @RequestBody User user) {
        return userService.getUserById(id)
                .map(existingUser -> {
                    user.setId(id);
                    return ResponseEntity.ok(userService.updateUser(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a user", description = "Deletes a user from the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID of the user to delete") @PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> {
                    userService.deleteUser(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Assign roles to a user", description = "Updates the roles assigned to a user. Only admins can perform this operation.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Roles assigned successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = RoleAssignmentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input - roles cannot be empty"),
            @ApiResponse(responseCode = "403", description = "Access denied - only admins can assign roles"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleAssignmentResponse> assignRoles(
            @Parameter(description = "ID of the user to update roles") @PathVariable Long id,
            @Valid @RequestBody RoleAssignmentRequest request) {
        
        return userService.getUserById(id)
                .map(existingUser -> {
                    existingUser.setRoles(request.getRoles());
                    User updatedUser = userService.updateUser(existingUser);
                    
                    RoleAssignmentResponse response = new RoleAssignmentResponse(
                            updatedUser.getId(),
                            updatedUser.getUsername(),
                            updatedUser.getRoles(),
                            "Roles assigned successfully"
                    );
                    
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    RoleAssignmentResponse response = new RoleAssignmentResponse(
                            id,
                            null,
                            null,
                            "User not found"
                    );
                    return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
                });
    }
}