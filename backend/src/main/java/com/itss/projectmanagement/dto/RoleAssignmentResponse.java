package com.itss.projectmanagement.dto;

import com.itss.projectmanagement.security.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleAssignmentResponse {
    private Long userId;
    private String username;
    private Set<Role> roles;
    private String message;
}