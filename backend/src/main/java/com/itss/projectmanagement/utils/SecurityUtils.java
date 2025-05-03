package com.itss.projectmanagement.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

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
     * Checks if the current authenticated user has leader role
     * @return true if the user has leader role, false otherwise
     */
    public static boolean isLeader() {
        return hasAuthority("LEADER");
    }
    
    /**
     * Checks if the current authenticated user has student role
     * @return true if the user has student role, false otherwise
     */
    public static boolean isStudent() {
        return hasAuthority("STUDENT");
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
}