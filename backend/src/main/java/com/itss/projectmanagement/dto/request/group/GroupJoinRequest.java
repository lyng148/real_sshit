package com.itss.projectmanagement.dto.request.group;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupJoinRequest {
    
    @NotNull(message = "Group ID is required")
    private Long groupId;
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
}