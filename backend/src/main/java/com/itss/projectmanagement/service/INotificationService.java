package com.itss.projectmanagement.service;

import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;

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
}