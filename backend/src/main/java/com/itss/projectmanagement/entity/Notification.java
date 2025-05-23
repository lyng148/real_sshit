package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(nullable = false, length = 1000)
    private String message;
    
    @Column(name = "is_read", nullable = false)
    private boolean isRead;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "notification_type", nullable = false)
    private String type;
    
    @Column(length = 255)
    private String link;
    
    @Column(columnDefinition = "TEXT")
    private String data; // JSON data for specific notification types
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
