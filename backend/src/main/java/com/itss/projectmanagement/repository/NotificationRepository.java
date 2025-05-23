package com.itss.projectmanagement.repository;

import com.itss.projectmanagement.entity.Notification;
import com.itss.projectmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find all notifications for a user, sorted by creation date (newest first)
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    // Count unread notifications for a user
    long countByUserAndIsReadFalse(User user);
    
    // Mark all notifications for a user as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user AND n.isRead = false")
    void markAllAsRead(User user);
}
