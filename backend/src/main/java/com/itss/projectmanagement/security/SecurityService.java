package com.itss.projectmanagement.security;

import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for handling security-related operations and authorization checks
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityService {

    private final GroupRepository groupRepository;
    private final ProjectRepository projectRepository;

    /**
     * Checks if a user is the leader of any group in the project
     * 
     * @param userId The ID of the user to check
     * @param projectId The ID of the project
     * @return True if the user is a leader of any group in the project
     */
//    public boolean isProjectGroupLeader(Long userId, Long projectId) {
//        Optional<Project> project = projectRepository.findById(projectId);
//        if (project.isEmpty()) {
//            return false;
//        }
//
//        List<Group> groups = groupRepository.findByProject(project.get());
//        return groups.stream()
//                .anyMatch(group -> {
//                    if (group.getLeader() == null) {
//                        return false;
//                    }
//                    return group.getLeader().getId().equals(userId);
//                });
//    }
    
    /**
     * Checks if a user is the leader of a specific group
     * 
     * @param userId The ID of the user to check
     * @param groupId The ID of the group
     * @return True if the user is the leader of the group
     */
    public boolean isProjectGroupLeader(Long userId, Long groupId) {
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isEmpty() || group.get().getLeader() == null) {
            return false;
        }
        
        return group.get().getLeader().getId().equals(userId);
    }
    
    /**
     * Checks if a user is a member of any group in the project
     * 
     * @param userId The ID of the user to check
     * @param projectId The ID of the project
     * @return True if the user is a member of any group in the project
     */
    public boolean isProjectMember(Long userId, Long projectId) {
        Optional<Project> project = projectRepository.findById(projectId);
        if (project.isEmpty()) {
            return false;
        }
        
        List<Group> groups = groupRepository.findByProject(project.get());
        return groups.stream()
                .anyMatch(group -> 
                    group.getMembers().stream()
                        .anyMatch(member -> member.getId().equals(userId)) ||
                    (group.getLeader() != null && group.getLeader().getId().equals(userId))
                );
    }
    
    /**
     * Checks if a user is a member of a specific group
     * 
     * @param userId The ID of the user to check
     * @param groupId The ID of the group
     * @return True if the user is a member of the group
     */
    public boolean isGroupMember(Long userId, Long groupId) {
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isEmpty()) {
            return false;
        }
        
        // Check if user is in members list or is the leader
        return group.get().getMembers().stream()
                .anyMatch(member -> member.getId().equals(userId)) ||
               (group.get().getLeader() != null && group.get().getLeader().getId().equals(userId));
    }
}