package com.itss.projectmanagement.dto.response.pressure;

import com.itss.projectmanagement.enums.PressureStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PressureScoreResponse {
    private Long userId;
    private String username;
    private String fullName;
    private Double pressureScore;
    private PressureStatus status;
    private Integer taskCount;
    private Integer threshold;
    private Double thresholdPercentage; // What percentage of the threshold this score represents
    private String statusDescription;
    private Long projectId;
    private String projectName;
}