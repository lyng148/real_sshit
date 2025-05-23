package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.notification.NotificationDTO;
import com.itss.projectmanagement.dto.response.notification.NotificationResponseDTO;
import com.itss.projectmanagement.entity.User;

public interface INotificationCrudService {
    
    /**
     * Get all notifications for the current user
     * 
     * @param user Current user
     * @return NotificationResponseDTO containing list of notifications and unread count
     */
    NotificationResponseDTO getUserNotifications(User user);
    
    /**
     * Mark a notification as read
     * 
     * @param user Current user
     * @param notificationId ID of the notification to mark as read
     * @return true if successful, false otherwise
     */
    boolean markAsRead(User user, Long notificationId);
    
    /**
     * Mark all notifications as read for the current user
     * 
     * @param user Current user
     * @return true if successful, false otherwise
     */
    boolean markAllAsRead(User user);
    
    /**
     * Delete a notification
     * 
     * @param user Current user
     * @param notificationId ID of the notification to delete
     * @return true if successful, false otherwise
     */
    boolean deleteNotification(User user, Long notificationId);
    
    /**
     * Create a new notification for a user
     * 
     * @param notification The notification to create
     * @return The created notification
     */
    NotificationDTO createNotification(NotificationDTO notification);
}
