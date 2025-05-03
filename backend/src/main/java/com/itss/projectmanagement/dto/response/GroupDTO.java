package com.itss.projectmanagement.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GroupDTO {
    private Long id;
    private String name;
    private String description;
    private String repositoryUrl;
    private Long projectId;
    private String projectName;
    private UserSummaryDTO leader;
    
    @Builder.Default
    private Set<UserSummaryDTO> members = new HashSet<>();
    
    private int memberCount;
    private int maxMembers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}