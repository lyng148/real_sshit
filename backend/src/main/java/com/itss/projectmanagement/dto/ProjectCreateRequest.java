package com.itss.projectmanagement.dto;

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
public class ProjectCreateRequest {
    
    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name cannot exceed 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @NotNull(message = "Maximum number of members is required")
    private Integer maxMembers;
    
    private String evaluationCriteria;
    
    @NotBlank(message = "GitHub repository URL is required")
    @Pattern(regexp = "^https://github\\.com/[\\w-]+/[\\w-]+(\\.[\\w-]+)*$", 
            message = "Invalid GitHub repository URL format")
    private String repositoryUrl;
    
    // Optional weights with default values
    private Double weightW1 = 0.4;
    private Double weightW2 = 0.3;
    private Double weightW3 = 0.2;
    private Double weightW4 = 0.1;
    
    // Optional threshold with default value
    private Double freeriderThreshold = 0.3;
    
    // Optional pressure threshold with default value
    private Integer pressureThreshold = 15;
}