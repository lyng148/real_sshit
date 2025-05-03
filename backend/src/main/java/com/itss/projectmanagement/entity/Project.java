package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project extends BaseEntity {
    
    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name cannot exceed 100 characters")
    @Column(nullable = false)
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(length = 500)
    private String description;
    
    @NotNull(message = "Maximum number of members is required")
    @Column(nullable = false)
    private Integer maxMembers;
    
    @Column(length = 1000)
    private String evaluationCriteria;
    
    // Weights for contribution score calculation
    @Column(nullable = false)
    @Builder.Default
    private Double weightW1 = 0.4; // Default weight for task completion
    
    @Column(nullable = false)
    @Builder.Default
    private Double weightW2 = 0.3; // Default weight for peer review
    
    @Column(nullable = false)
    @Builder.Default
    private Double weightW3 = 0.2; // Default weight for commits
    
    @Column(nullable = false)
    @Builder.Default
    private Double weightW4 = 0.1; // Default weight for late tasks
    
    // Threshold for detecting free-riders (percentage of average group score)
    @Column(nullable = false)
    @Builder.Default
    private Double freeriderThreshold = 0.3; // Default 30%
    
    // Pressure Score configuration
    @Column(nullable = false)
    @Builder.Default
    private Integer pressureThreshold = 15; // Default threshold
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;
}