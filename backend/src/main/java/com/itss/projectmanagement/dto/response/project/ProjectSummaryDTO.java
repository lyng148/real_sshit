package com.itss.projectmanagement.dto.response.project;

import com.itss.projectmanagement.dto.response.user.UserSummaryDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProjectSummaryDTO {
    private Long id;
    private String name;
    private Double freeriderThreshold;
    private UserSummaryDTO instructor;
}
