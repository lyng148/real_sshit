package com.itss.projectmanagement.dto.request.project;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectInviteRequest {
    private Long projectId;
    
    @NotEmpty(message = "At least one student must be specified")
    private List<String> usernames;
}
