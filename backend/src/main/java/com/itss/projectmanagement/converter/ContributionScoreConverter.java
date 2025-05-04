package com.itss.projectmanagement.converter;

import com.itss.projectmanagement.dto.response.contribution.ContributionScoreResponse;
import com.itss.projectmanagement.entity.ContributionScore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ContributionScoreConverter {
    
    /**
     * Convert a ContributionScore entity to response DTO
     * @param score ContributionScore entity
     * @return ContributionScoreResponse DTO
     */
    public ContributionScoreResponse toResponse(ContributionScore score) {
        if (score == null) {
            return null;
        }
        
        return ContributionScoreResponse.builder()
                .id(score.getId())
                .userId(score.getUser().getId())
                .username(score.getUser().getUsername())
                .fullName(score.getUser().getFullName())
                .email(score.getUser().getEmail())
                .projectId(score.getProject().getId())
                .projectName(score.getProject().getName())
                .taskCompletionScore(score.getTaskCompletionScore())
                .peerReviewScore(score.getPeerReviewScore())
                .commitCount(score.getCommitCount())
                .lateTaskCount(score.getLateTaskCount())
                .calculatedScore(score.getCalculatedScore())
                .adjustedScore(score.getAdjustedScore())
                .adjustmentReason(score.getAdjustmentReason())
                .isFinal(score.getIsFinal())
                .updatedAt(score.getUpdatedAt())
                .build();
    }
}