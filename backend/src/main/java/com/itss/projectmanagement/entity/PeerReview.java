package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "peer_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeerReview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "score", nullable = false)
    private Double score;

    @Min(value = 1, message = "Completion score must be at least 1")
    @Max(value = 5, message = "Completion score must be at most 5")
    @Column(name = "completion_score", nullable = false)
    private Double completionScore;

    @Max(value = 5, message = "Cooperation score must be at most 5")
    @Min(value = 1, message = "Cooperation score must be at least 1")
    @Column(name = "cooperation_score", nullable = false)
    private Double cooperationScore;

    @Column(name = "review_week")
    private Integer reviewWeek;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "is_valid", nullable = false)
    @Builder.Default
    private Boolean isValid = true;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "check_notified", nullable = false)
    @Builder.Default
    private Boolean checkNotified = false;

    @Override
    protected void onCreate() {
        super.onCreate();
        this.assignedAt = LocalDateTime.now();
    }
}