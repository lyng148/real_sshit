package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.response.notification.NotificationResponseDTO;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.service.INotificationCrudService;
import com.itss.projectmanagement.service.IUserService;
import com.itss.projectmanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final INotificationCrudService notificationService;
    private final IUserService userService;

    /**
     * Get all notifications for the current user
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<NotificationResponseDTO> getNotifications() {
        User user = userService.getUserById(SecurityUtils.getCurrentUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        NotificationResponseDTO response = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark a notification as read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable("id") Long notificationId
    ) {
        User user = userService.getUserById(SecurityUtils.getCurrentUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean success = notificationService.markAsRead(user, notificationId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Notification marked as read" : "Failed to mark notification as read");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        User user = userService.getUserById(SecurityUtils.getCurrentUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean success = notificationService.markAllAsRead(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "All notifications marked as read" : "Failed to mark all notifications as read");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a notification
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteNotification(
            @PathVariable("id") Long notificationId
    ) {
        User user = userService.getUserById(SecurityUtils.getCurrentUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean success = notificationService.deleteNotification(user, notificationId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Notification deleted" : "Failed to delete notification");
        
        return ResponseEntity.ok(response);
    }
}
