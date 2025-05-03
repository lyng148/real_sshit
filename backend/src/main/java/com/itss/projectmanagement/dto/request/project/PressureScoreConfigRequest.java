package com.itss.projectmanagement.dto.request.project;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PressureScoreConfigRequest {
    
    @NotNull(message = "Pressure threshold is required")
    @Min(value = 1, message = "Pressure threshold must be at least 1")
    @Max(value = 50, message = "Pressure threshold cannot exceed 50")
    private Integer pressureThreshold;
}