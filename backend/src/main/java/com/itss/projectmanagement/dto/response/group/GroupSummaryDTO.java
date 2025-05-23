package com.itss.projectmanagement.dto.response.group;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GroupSummaryDTO {
    private Long id;
    private String name;
    private String repositoryUrl;
}
