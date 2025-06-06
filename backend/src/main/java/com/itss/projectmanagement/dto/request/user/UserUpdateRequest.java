package com.itss.projectmanagement.dto.request.user;

import com.itss.projectmanagement.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;
    
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;
    
    @Size(max = 500, message = "Avatar URL cannot exceed 500 characters")
    private String avatarUrl;

    private Set<Role> roles;

    private Boolean enabled;
} 