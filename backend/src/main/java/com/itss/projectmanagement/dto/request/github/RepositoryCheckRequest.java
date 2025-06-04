package com.itss.projectmanagement.dto.request.github;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryCheckRequest {
    
    @NotBlank(message = "Repository owner is required")
    private String owner;
    
    @NotBlank(message = "Repository name is required")
    private String repo;
    
    @NotBlank(message = "Repository URL is required")
    @Pattern(regexp = "^https://github\\.com/[^/]+/[^/]+$",
            message = "Invalid GitHub repository URL format. Must be like: https://github.com/username/repository")
    private String repoUrl;
} 