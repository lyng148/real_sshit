package com.itss.projectmanagement.dto.response.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private boolean success;
    private String message;
    private List<NotificationDTO> data;
    private long unreadCount;
}
