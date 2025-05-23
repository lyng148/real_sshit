package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.dto.response.notification.NotificationDTO;
import com.itss.projectmanagement.dto.response.notification.NotificationResponseDTO;
import com.itss.projectmanagement.entity.Notification;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.NotificationRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.INotificationCrudService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationCrudServiceImpl implements INotificationCrudService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public NotificationResponseDTO getUserNotifications(User user) {
        try {
            List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
            long unreadCount = notificationRepository.countByUserAndIsReadFalse(user);
            
            List<NotificationDTO> notificationDTOs = notifications.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            return NotificationResponseDTO.builder()
                    .success(true)
                    .message("Notifications retrieved successfully")
                    .data(notificationDTOs)
                    .unreadCount(unreadCount)
                    .build();
        } catch (Exception e) {
            log.error("Error getting notifications for user {}: {}", user.getEmail(), e.getMessage(), e);
            return NotificationResponseDTO.builder()
                    .success(false)
                    .message("Failed to retrieve notifications")
                    .build();
        }
    }

    @Override
    @Transactional
    public boolean markAsRead(User user, Long notificationId) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            
            if (notificationOpt.isPresent()) {
                Notification notification = notificationOpt.get();
                
                // Check if notification belongs to the user
                if (!notification.getUser().getId().equals(user.getId())) {
                    log.warn("User {} attempted to mark notification {} as read, but it belongs to another user", 
                            user.getEmail(), notificationId);
                    return false;
                }
                
                notification.setRead(true);
                notificationRepository.save(notification);
                return true;
            }
            
            return false;
        } catch (Exception e) {
            log.error("Error marking notification {} as read: {}", notificationId, e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean markAllAsRead(User user) {
        try {
            notificationRepository.markAllAsRead(user);
            return true;
        } catch (Exception e) {
            log.error("Error marking all notifications as read for user {}: {}", user.getEmail(), e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean deleteNotification(User user, Long notificationId) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            
            if (notificationOpt.isPresent()) {
                Notification notification = notificationOpt.get();
                
                // Check if notification belongs to the user
                if (!notification.getUser().getId().equals(user.getId())) {
                    log.warn("User {} attempted to delete notification {}, but it belongs to another user", 
                            user.getEmail(), notificationId);
                    return false;
                }
                
                notificationRepository.delete(notification);
                return true;
            }
            
            return false;
        } catch (Exception e) {
            log.error("Error deleting notification {}: {}", notificationId, e.getMessage(), e);
            return false;
        }
    }    @Override
    @Transactional
    public NotificationDTO createNotification(NotificationDTO notificationDTO) {
        try {
            Optional<User> userOpt = userRepository.findById(notificationDTO.getUserId());
            
            if (userOpt.isEmpty()) {
                log.error("User with id {} not found", notificationDTO.getUserId());
                return null;
            }
            
            User user = userOpt.get();
            
            Notification notification = Notification.builder()
                    .user(user)
                    .title(notificationDTO.getTitle())
                    .message(notificationDTO.getMessage())
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .type(notificationDTO.getType())
                    .link(notificationDTO.getLink())
                    .data(notificationDTO.getData())
                    .build();
            
            Notification savedNotification = notificationRepository.save(notification);
            NotificationDTO savedDTO = convertToDTO(savedNotification);
            
            // Note: We no longer need to send via WebSocket as we're using Novu for all notifications
            
            return savedDTO;
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage(), e);
            return null;
        }
    }
    
    // Helper method to convert entity to DTO
    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .type(notification.getType())
                .link(notification.getLink())
                .data(notification.getData())
                .build();
    }
}
