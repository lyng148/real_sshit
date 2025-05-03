package com.itss.projectmanagement.service;

import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final GroupRepository groupRepository;

    /**
     * Notifies all group leaders for a specific project
     * 
     * @param project The project
     * @param title Notification title
     * @param message Notification message
     */
    public void notifyProjectLeaders(Project project, String title, String message) {
        List<Group> groups = groupRepository.findByProject(project);
        List<User> leaders = new ArrayList<>();
        
        // Get group leaders, filtering out null leaders
        for (Group group : groups) {
            if (group.getLeader() != null) {
                leaders.add(group.getLeader());
            }
        }
        
        if (leaders.isEmpty()) {
            log.warn("No group leaders found for project {}", project.getName());
            return;
        }
        
        for (User leader : leaders) {
            notifyUser(leader, title, message);
        }
        
        log.info("Sent '{}' notification to {} group leaders for project {}", 
                title, leaders.size(), project.getName());
    }
    
    /**
     * Notifies a specific user
     * 
     * @param user The user to notify
     * @param title Notification title
     * @param message Notification message
     */
    public void notifyUser(User user, String title, String message) {
        // In a real implementation, this would send an actual notification
        // via email, push notification, or an in-app notification system
        
        // For now, we'll just log it
        log.info("Notification to {}: {} - {}", user.getEmail(), title, message);
        
        // TODO: Implement actual notification delivery when a notification system is available
    }
}