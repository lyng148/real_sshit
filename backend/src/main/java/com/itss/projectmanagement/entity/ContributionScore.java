package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
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
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    // Core metrics for score calculation
    private Double taskCompletionScore; // Weighted task completion score
    private Double peerReviewScore; // Average peer review score
    private Long commitCount; // Number of valid commits
    private Long lateTaskCount; // Number of late completed tasks
    
    // Final scores
    private Double calculatedScore; // Score calculated by the system
    private Double adjustedScore; // Score after instructor adjustment
    private String adjustmentReason; // Reason for adjustment
    
    private Boolean isFinal; // Indicates if this is the final score
}