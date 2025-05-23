package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "free_rider_cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreeRiderCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    // Status: pending, contacted, resolved
    @Column(nullable = false)
    private String status;

    // Resolution: warning, reassignment, penalty, other
    private String resolution;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime detectedAt;

    private LocalDateTime contactedAt;

    private LocalDateTime resolvedAt;

    // Store evidence as JSON
    @Column(columnDefinition = "TEXT")
    private String evidenceJson;
}
