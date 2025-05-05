package com.itss.projectmanagement.dto.response.peer;

import com.itss.projectmanagement.dto.response.user.UserSummaryDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeerReviewResponse {
    private Long id;
    private UserSummaryDTO reviewer;
    private UserSummaryDTO reviewee;
    private Long projectId;
    private String projectName;
    private Double score;
    private Double completionScore;
    private Double cooperationScore;
    private Integer reviewWeek;
    private String comment;
    private Boolean isCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}