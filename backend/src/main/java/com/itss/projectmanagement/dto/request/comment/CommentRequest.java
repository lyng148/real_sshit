package com.itss.projectmanagement.dto.request.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    
    @NotBlank(message = "Comment content is required")
    @Size(max = 1000, message = "Comment content cannot exceed 1000 characters")
    private String content;
    
    @NotNull(message = "Task ID is required")
    private Long taskId;
}