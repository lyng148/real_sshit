package com.itss.projectmanagement.dto.request.project;

import jakarta.validation.constraints.*;
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
    @Min(value = 1, message = "Maximum members must be at least 1")
    @Max(value = 20, message = "Maximum members cannot exceed 20")
    private Integer maxMembers;
    
    @Size(max = 1000, message = "Evaluation criteria cannot exceed 1000 characters")
    private String evaluationCriteria;
    
    // Optional weights with default values
    @Builder.Default
    @DecimalMin(value = "0.0", message = "Weight W1 must be non-negative")
    @DecimalMax(value = "1.0", message = "Weight W1 cannot exceed 1.0")
    private Double weightW1 = 0.4;

    @Builder.Default
    @DecimalMin(value = "0.0", message = "Weight W2 must be non-negative")
    @DecimalMax(value = "1.0", message = "Weight W2 cannot exceed 1.0")
    private Double weightW2 = 0.3;

    @Builder.Default
    @DecimalMin(value = "0.0", message = "Weight W3 must be non-negative")
    @DecimalMax(value = "1.0", message = "Weight W3 cannot exceed 1.0")
    private Double weightW3 = 0.2;

    @Builder.Default
    @DecimalMin(value = "0.0", message = "Weight W4 must be non-negative")
    @DecimalMax(value = "1.0", message = "Weight W4 cannot exceed 1.0")
    private Double weightW4 = 0.1;
    
    @Builder.Default
    @DecimalMin(value = "0.0", message = "Free rider threshold must be non-negative")
    @DecimalMax(value = "1.0", message = "Free rider threshold cannot exceed 1.0")
    private Double freeriderThreshold = 0.3;
    
    @Builder.Default
    @Min(value = 1, message = "Pressure threshold must be at least 1")
    @Max(value = 50, message = "Pressure threshold cannot exceed 50")
    private Integer pressureThreshold = 15;
}