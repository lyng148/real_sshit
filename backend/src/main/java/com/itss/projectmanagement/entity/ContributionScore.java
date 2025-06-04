package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "contribution_scores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributionScore extends BaseEntity {
    
    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotNull(message = "Project is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    // Core metrics for score calculation
    @DecimalMin(value = "0.0", message = "Task completion score must be non-negative")
    private Double taskCompletionScore; // Weighted task completion score
    
    @DecimalMin(value = "0.0", message = "Peer review score must be non-negative")
    private Double peerReviewScore; // Average peer review score
    
    @Min(value = 0, message = "Commit count must be non-negative")
    private Long commitCount; // Number of valid commits
    
    @Min(value = 0, message = "Late task count must be non-negative")
    private Long lateTaskCount; // Number of late completed tasks
    
    // Final scores
    @DecimalMin(value = "0.0", message = "Calculated score must be non-negative")
    private Double calculatedScore; // Score calculated by the system
    
    @DecimalMin(value = "0.0", message = "Adjusted score must be non-negative")
    private Double adjustedScore; // Score after instructor adjustment
    
    @Size(max = 500, message = "Adjustment reason cannot exceed 500 characters")
    private String adjustmentReason; // Reason for adjustment
    
    private Boolean isFinal; // Indicates if this is the final score
}