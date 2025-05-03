package com.itss.projectmanagement.dto.request.user;

import com.itss.projectmanagement.enums.Role;
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