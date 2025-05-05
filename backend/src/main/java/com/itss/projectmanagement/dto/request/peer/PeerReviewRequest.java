package com.itss.projectmanagement.dto.request.peer;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeerReviewRequest {
    
    @NotNull(message = "Reviewee ID is required")
    private Long revieweeId;
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    @NotNull(message = "Completion score is required")
    @Min(value = 1, message = "Completion score must be between 1 and 5")
    @Max(value = 5, message = "Completion score must be between 1 and 5")
    private Double completionScore;
    
    @NotNull(message = "Cooperation score is required")
    @Min(value = 1, message = "Cooperation score must be between 1 and 5")
    @Max(value = 5, message = "Cooperation score must be between 1 and 5")
    private Double cooperationScore;
    
    private String comment;
}