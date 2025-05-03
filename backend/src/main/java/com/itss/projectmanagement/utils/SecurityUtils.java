package com.itss.projectmanagement.utils;

import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.enums.Role;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

/**
 * Utility class for security and authorization related operations
 */
public class SecurityUtils {

    /**
     * Checks if the current authenticated user has admin role
     * @return true if the user has admin role, false otherwise
     */
    public static boolean isAdmin() {
        return hasAuthority("ADMIN");
    }
    
    /**
     * Checks if the current authenticated user has instructor role
     * @return true if the user has instructor role, false otherwise
     */
    public static boolean isInstructor() {
        return hasAuthority("INSTRUCTOR");
    }
    
    /**
     * Checks if the current authenticated user has student role
     * @return true if the user has student role, false otherwise
     */
    public static boolean isStudent() {
        return hasAuthority("STUDENT");
    }
    
    /**
     * Checks if the current authenticated user is the leader of a specific group
     * @param groupRepository the group repository
     * @param groupId the group ID to check
     * @return true if the user is the leader of the specified group, false otherwise
     */
    public static boolean isGroupLeader(GroupRepository groupRepository, Long groupId) {
        String username = getCurrentUsername();
        if (username == null) {
            return false;
        }
        
        return groupRepository.findById(groupId)
                .filter(group -> group.getLeader() != null)
                .map(group -> group.getLeader().getUsername().equals(username))
                .orElse(false);
    }
    
    /**
     * Checks if the current authenticated user is the leader of any group
     * @param groupRepository the group repository
     * @return true if the user is a leader of any group, false otherwise
     */
    public static boolean isAnyGroupLeader(GroupRepository groupRepository, UserRepository userRepository) {
        User currentUser = getCurrentUser(userRepository);
        if (currentUser == null) {
            return false;
        }
        
        List<Group> leadGroups = groupRepository.findByLeader(currentUser);
        return !leadGroups.isEmpty();
    }
    
    /**
     * Checks if the current authenticated user has the specified authority/role
     * @param authority the authority/role to check
     * @return true if the user has the authority, false otherwise
     */
    public static boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals(authority));
    }
    
    /**
     * Checks if the current authenticated user has any of the specified authorities/roles
     * @param roles the roles to check
     * @return true if the user has any of the roles, false otherwise
     */
    public static boolean hasAnyRole(Role... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        
        for (Role role : roles) {
            if (authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(auth -> auth.equals(role.name()))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get the username of the current authenticated user
     * @return the username or null if not authenticated
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return null;
        }
        return authentication.getName();
    }
    
    /**
     * Get the current authenticated user entity from the database
     * @param userRepository the user repository to fetch user data
     * @return the current User entity or throws IllegalStateException if not found
     */
    public static User getCurrentUser(UserRepository userRepository) {
        String username = getCurrentUsername();
        if (username == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));
    }
}