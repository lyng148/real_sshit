package com.itss.projectmanagement.dto.response.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String type;
    private String link;
    private String data; // JSON string
}
