package com.itss.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscribers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscriber {
    
    @Id
    @Column(name = "user_id")
    private Long userId;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "subscriber_id", nullable = false)
    private String subscriberId;
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
    
    @Column(name = "notification_preference", nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'ALL'")
    private String notificationPreference = "ALL";
}
