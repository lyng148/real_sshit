package com.itss.projectmanagement.dto.response.project;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.itss.projectmanagement.dto.response.user.UserSummaryDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private Integer maxMembers;
    private String evaluationCriteria;

    // Weights for contribution score calculation
    private Double weightW1;
    private Double weightW2;
    private Double weightW3;
    private Double weightW4;
    
    // Threshold for detecting free-riders
    private Double freeriderThreshold;
    
    // Pressure Score configuration
    private Integer pressureThreshold;
    
    // Instructor information (simplified)
    private UserSummaryDTO instructor;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional metadata that might be useful
    private Integer totalGroups;
    private Integer totalMembers;
}