package com.itss.projectmanagement.dto.response.comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private String content;
    private Long authorId;
    private String authorName;
    private String authorAvatarUrl;
    private Long taskId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}