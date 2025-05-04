package com.itss.projectmanagement.dto.request.contribution;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoreAdjustmentRequest {
    @NotNull(message = "Adjusted score is required")
    private Double adjustedScore;
    
    @Size(max = 500, message = "Adjustment reason cannot exceed 500 characters")
    private String adjustmentReason;
}