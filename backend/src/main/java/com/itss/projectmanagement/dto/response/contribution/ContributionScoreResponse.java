package com.itss.projectmanagement.dto.response.contribution;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributionScoreResponse {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private Long projectId;
    private String projectName;
    private Double taskCompletionScore;
    private Double peerReviewScore;
    private Long lateTaskCount;
    
    private Long totalAdditions; // Lines added across all valid commits
    private Long totalDeletions; // Lines deleted across all valid commits
    private Double codeContributionScore; // Weighted score: (additions * 1.0) + (deletions * 1.25)
    
    private Double calculatedScore;
    private Double adjustedScore;
    private String adjustmentReason;
    private Boolean isFinal;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
}