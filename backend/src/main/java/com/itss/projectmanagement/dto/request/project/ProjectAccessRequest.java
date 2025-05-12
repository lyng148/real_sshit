package com.itss.projectmanagement.dto.request.project;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectAccessRequest {
    @NotBlank(message = "Access code is required")
    private String accessCode;
}
