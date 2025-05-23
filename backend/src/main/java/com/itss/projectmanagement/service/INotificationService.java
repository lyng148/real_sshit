package com.itss.projectmanagement.service;

import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;

import java.util.Map;

public interface INotificationService {
    /**
     * Notifies all group leaders for a specific project
     * 
     * @param project The project
     * @param title Notification title
     * @param message Notification message
     */
    void notifyProjectLeaders(Project project, String title, String message);    
    /**
     * Notifies a specific user
     * 
     * @param user The user to notify
     * @param title Notification title
     * @param message Notification message
     */
    void notifyUser(User user, String title, String message);
    
    /**
     * Notifies a specific user with additional parameters
     * 
     * @param user The user to notify
     * @param title Notification title
     * @param message Notification message
     * @param type Notification type
     * @param link Optional link to include with the notification
     */
    void notifyUser(User user, String title, String message, String type, String link);
    
    /**
     * Thông báo cho giảng viên về free-rider được phát hiện
     *
     * @param instructor Giảng viên cần thông báo
     * @param project Dự án có free-rider
     * @param freeRider Người dùng được phát hiện là free-rider
     * @param evidence Bằng chứng về free-rider
     */
    void notifyInstructorAboutFreeRider(User instructor, Project project, User freeRider, Map<String, Object> evidence);
}