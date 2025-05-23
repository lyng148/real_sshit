package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.dto.response.notification.NotificationDTO;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.service.INotificationCrudService;
import com.itss.projectmanagement.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements INotificationService {
    private final GroupRepository groupRepository;
    private final INotificationCrudService notificationCrudService;

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

        String link = "/projects/" + project.getId() + "/details";
        for (User leader : leaders) {
            notifyUser(leader, title, message, "PROJECT_NOTIFICATION", link);
        }

        log.info("Sent '{}' notification to {} group leaders for project {}",
                title, leaders.size(), project.getName());
    }    
    
    /**
     * Notify instructor about detected free-rider
     *
     * @param instructor Instructor to notify
     * @param project Project with free-rider
     * @param freeRider User detected as free-rider
     * @param evidence Evidence of free-rider
     */      
    public void notifyInstructorAboutFreeRider(User instructor, Project project, User freeRider, Map<String, Object> evidence) {
        String title = "Free-Rider Detection Alert";
        String message = String.format("A potential free-rider has been detected in project '%s': %s",
                project.getName(), freeRider.getFullName());
        String link = "/freerider-detection/evidence/" + project.getId() + "/" + freeRider.getId();
        
        try {
            // Save data as JSON string
            String jsonData = String.format("{\"projectId\":%d,\"freeRiderId\":%d}", project.getId(), freeRider.getId());
            
            // Create notification record via the database service
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setUserId(instructor.getId());
            notificationDTO.setTitle(title);
            notificationDTO.setMessage(message);
            notificationDTO.setType("FREE_RIDER_ALERT");
            notificationDTO.setLink(link);
            notificationDTO.setData(jsonData);
            
            notificationCrudService.createNotification(notificationDTO);
            
            log.info("Free-rider alert sent to instructor {}: {} is potential free-rider in project {}", 
                    instructor.getEmail(), freeRider.getEmail(), project.getName());
        } catch (Exception e) {
            log.error("Failed to send free-rider alert to {}: {}", instructor.getEmail(), e.getMessage(), e);
        }
    }
    
    /**
     * Notifies a specific user
     *
     * @param user The user to notify
     * @param title Notification title
     * @param message Notification message
     */    
    public void notifyUser(User user, String title, String message) {
        notifyUser(user, title, message, "GENERAL", null);
    }
      
    /**
     * Notifies a specific user with additional parameters
     *
     * @param user The user to notify
     * @param title Notification title
     * @param message Notification message
     * @param type Notification type
     * @param link Optional link to include with the notification
     */    
    public void notifyUser(User user, String title, String message, String type, String link) {
        log.info("Preparing to save notification to user: {} ({}), title: {}", user.getFullName(), user.getEmail(), title);
        
        try {
            // Create notification DTO
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setUserId(user.getId());
            notificationDTO.setTitle(title);
            notificationDTO.setMessage(message);
            notificationDTO.setType(type);
            notificationDTO.setLink(link);
            
            NotificationDTO savedNotification = notificationCrudService.createNotification(notificationDTO);
            
            if (savedNotification != null) {
                log.info("Notification saved to database with ID: {}", savedNotification.getId());
                log.info("Notification process completed successfully for user {}: {} - {}", 
                        user.getEmail(), title, message);
            } else {
                log.error("Failed to save notification to database for user: {}", user.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to save notification to database for {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }
}