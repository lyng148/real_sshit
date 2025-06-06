package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import lombok.*;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "commit_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitRecord extends BaseEntity {
    @Column(nullable = false)
    private String commitId;
    
    @Column(nullable = false)
    private String message;
    
    @Column(nullable = false)
    private String authorName;
    
    @Column(nullable = false)
    private String authorEmail;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Builder.Default
    private boolean valid=true;
    
    @Column(name = "additions")
    private Integer additions; // Number of lines added
    
    @Column(name = "deletions")
    private Integer deletions; // Number of lines deleted
    
    /**
     * Validation to ensure data consistency:
     * If task is not null, task.group must equal this commit.group
     */
    @AssertTrue(message = "Task group must match commit group when task is present")
    public boolean isTaskGroupConsistent() {
        return task == null || task.getGroup().getId().equals(group.getId());
    }
}