package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    
    @Column(name = "task_id_string")
    private String taskId;
    
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
    
    private boolean isValid;
}