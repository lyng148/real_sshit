package com.itss.projectmanagement.dto;

import com.itss.projectmanagement.security.Role;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleAssignmentRequest {
    
    @NotEmpty(message = "Roles cannot be empty")
    private Set<Role> roles;
}