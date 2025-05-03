package com.itss.projectmanagement.security;

import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service to handle security checks related to Group entities
 */
@Service
@RequiredArgsConstructor
public class GroupSecurityService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    /**
     * Check if a user is the leader of a specific group
     * 
     * @param user The authenticated user
     * @param groupId The group ID to check
     * @return true if the user is the leader of the group, false otherwise
     */
    public boolean isGroupLeader(Object user, Long groupId) {
        if (user == null || groupId == null) {
            return false;
        }

        try {
            User authenticatedUser = (User) user;
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            
            if (groupOpt.isEmpty()) {
                return false;
            }
            
            Group group = groupOpt.get();
            return group.getLeader() != null && 
                   group.getLeader().getId().equals(authenticatedUser.getId());
        } catch (ClassCastException e) {
            return false;
        }
    }
    
    /**
     * Check if a user is the leader of any group that a specific user belongs to
     * 
     * @param user The authenticated user
     * @param userId The user ID to check
     * @return true if the authenticated user is the leader of any group the specified user belongs to
     */
    public boolean isLeaderOfUserGroup(Object user, Long userId) {
        if (user == null || userId == null) {
            return false;
        }

        try {
            User authenticatedUser = (User) user;
            User targetUser = userRepository.findById(userId).orElse(null);
            
            if (targetUser == null) {
                return false;
            }
            
            // Find all groups where the authenticated user is the leader
            List<Group> ledGroups = groupRepository.findByLeaderId(authenticatedUser.getId());
            
            // Check if the target user is a member of any of these groups
            for (Group group : ledGroups) {
                if (group.getMembers().contains(targetUser)) {
                    return true;
                }
            }
            
            return false;
        } catch (ClassCastException e) {
            return false;
        }
    }
}