package com.itss.projectmanagement.dto.request.group;

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
public class GroupUpdateRequest {
    
    @Size(min = 3, max = 100, message = "Group name must be between 3 and 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @Pattern(regexp = "^(https://github\\.com/[\\w-]+/[\\w\\.-_]+|git@github\\.com:[\\w-]+/[\\w\\.-_]+(\\.git)?)?$", 
            message = "Invalid GitHub repository URL format. Must be like: https://github.com/username/repository or git@github.com:username/repository.git")
    private String repositoryUrl;
    
    private Long leaderId;
}