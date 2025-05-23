package com.itss.projectmanagement.dto.response.freerider;

import com.itss.projectmanagement.dto.response.group.GroupSummaryDTO;
import com.itss.projectmanagement.dto.response.project.ProjectSummaryDTO;
import com.itss.projectmanagement.dto.response.user.UserSummaryDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class FreeRiderCaseDTO {
    private Long id;
    private UserSummaryDTO student;
    private ProjectSummaryDTO project;
    private GroupSummaryDTO group;
    private String status;
    private String resolution;
    private String notes;
    private LocalDateTime detectedAt;
    private LocalDateTime contactedAt;
    private LocalDateTime resolvedAt;
    private String evidenceJson;
}
