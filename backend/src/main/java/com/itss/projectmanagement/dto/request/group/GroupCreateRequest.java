package com.itss.projectmanagement.dto.request.group;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupCreateRequest {
    
    @NotBlank(message = "Group name is required")
    @Size(max = 100, message = "Group name cannot exceed 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;    
      @NotBlank(message = "GitHub repository URL is required")
    @Pattern(regexp = "^https://github\\.com/[^/]+/[^/]+$",
            message = "Invalid GitHub repository URL format. Must be like: https://github.com/username/repository")
    private String repositoryUrl;
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
}