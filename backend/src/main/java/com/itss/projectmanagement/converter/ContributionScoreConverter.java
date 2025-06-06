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
     * @param entity ContributionScore entity
     * @return ContributionScoreResponse DTO
     */
    public ContributionScoreResponse toResponse(ContributionScore entity) {
        if (entity == null) {
            return null;
        }
        
        return ContributionScoreResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .username(entity.getUser().getUsername())
                .fullName(entity.getUser().getFullName())
                .email(entity.getUser().getEmail())
                .projectId(entity.getProject().getId())
                .projectName(entity.getProject().getName())
                .taskCompletionScore(entity.getTaskCompletionScore())
                .peerReviewScore(entity.getPeerReviewScore())
                .lateTaskCount(entity.getLateTaskCount())
                .totalAdditions(entity.getTotalAdditions())
                .totalDeletions(entity.getTotalDeletions())
                .codeContributionScore(entity.getCodeContributionScore())
                .calculatedScore(entity.getCalculatedScore())
                .adjustedScore(entity.getAdjustedScore())
                .adjustmentReason(entity.getAdjustmentReason())
                .isFinal(entity.getIsFinal())
                .updatedAt(entity.getUpdatedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}