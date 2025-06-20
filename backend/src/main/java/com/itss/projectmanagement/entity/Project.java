package com.itss.projectmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projects")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project extends BaseEntity {
    
    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name cannot exceed 100 characters")
    @Column(nullable = false, columnDefinition = "varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci")
    private String name;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(length = 500)
    private String description;
    
    @Size(max = 8, min = 8, message = "Access code must be exactly 8 characters")
    @Column(length = 8, unique = true)
    private String accessCode;
    
    @NotNull(message = "Maximum number of members is required")
    @Column(nullable = false)
    private Integer maxMembers;
    
    @Column(length = 1000)
    private String evaluationCriteria;
    
    // Weights for contribution score calculation - MUST sum to 1.0
    @Column(nullable = false)
    @Builder.Default
    private Double weightW1 = 0.5; // Default weight for task completion (50%)
    
    @Column(nullable = false)
    @Builder.Default
    private Double weightW2 = 0.3; // Default weight for peer review (30%)
    
    @Column(nullable = false)
    @Builder.Default
    private Double weightW3 = 0.2; // Default weight for code contribution (20%)
    
    @Column(nullable = false)
    @Builder.Default
    private Double weightW4 = 0.1; // Independent penalty weight for late tasks
    
    // Threshold for detecting free-riders (percentage of average group score)
    @Column(nullable = false)
    @Builder.Default
    private Double freeriderThreshold = 0.3; // Default 30%
    
    // Pressure Score configuration
    @Column(nullable = false)
    @Builder.Default
    private Integer pressureThreshold = 15; // Default threshold
    
    // Project status - indicates if the project is finalized
    @Column(nullable = false)
    @Builder.Default
    private Boolean isFinalized = false; // Default is not finalized
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;
    
    // Project has many groups - cascade delete to remove all groups when project is deleted
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Group> groups = new HashSet<>();

    // Project has many peer reviews - cascade delete to remove all peer reviews when project is deleted
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<PeerReview> peerReviews = new HashSet<>();
    
    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<FreeRiderCase> freeRiderCases = new HashSet<>();
    
    // Project has many contribution scores - cascade delete to remove all scores when project is deleted
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ContributionScore> contributionScores = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ProjectStudent> projectStudents = new HashSet<>();
    
    /**
     * Validation to ensure W1 + W2 + W3 = 1.0 for normalized scoring
     */
    @AssertTrue(message = "Weight factors W1, W2, W3 must sum to 1.0 for normalized scoring")
    public boolean isWeightSumValid() {
        if (weightW1 == null || weightW2 == null || weightW3 == null) {
            return false;
        }
        double sum = weightW1 + weightW2 + weightW3;
        // Allow small floating point tolerance
        return Math.abs(sum - 1.0) < 0.001;
    }
    
    /**
     * Validation to ensure W4 (penalty factor) is non-negative
     * W4 should not be negative as it's a penalty that reduces scores
     */
    @AssertTrue(message = "Weight factor W4 (penalty) must be non-negative")
    public boolean isW4Valid() {
        return weightW4 != null && weightW4 >= 0.0;
    }
}