package com.itss.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommitRecordDTO {
    private Long id;
    private String commitId;
    private String message;
    private String taskId;
    private String authorName;
    private String authorEmail;
    private LocalDateTime timestamp;
    private Long userId;
    private String username;
    private Long projectId;
    private String projectName;
    private Long groupId;
    private String groupName;
    private Long taskIdLong;
    private String taskName;
    private boolean isValid;
    private LocalDateTime createdAt;
}