package com.itss.projectmanagement.entity;

import com.itss.projectmanagement.enums.FreeRiderStatus;
import com.itss.projectmanagement.enums.FreeRiderResolution;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FreeRiderStatus status;

    @Enumerated(EnumType.STRING)
    private FreeRiderResolution resolution;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
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
