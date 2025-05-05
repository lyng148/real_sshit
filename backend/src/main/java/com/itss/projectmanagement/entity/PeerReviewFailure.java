package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity to track users who fail to complete their peer reviews within the 24-hour period
 */
@Entity
@Table(name = "peer_review_failures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeerReviewFailure extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "failure_date", nullable = false)
    private LocalDateTime failureDate;

    @Column(name = "review_week", nullable = false)
    private Integer reviewWeek;

    @Column(name = "notification_sent")
    private Boolean notificationSent;

    @Column(name = "completed_late")
    private Boolean completedLate;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;
}