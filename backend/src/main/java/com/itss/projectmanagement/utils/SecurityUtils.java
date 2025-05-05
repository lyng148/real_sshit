package com.itss.projectmanagement.utils;

import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.enums.Role;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.UserRepository;

import java.util.List;

/**
 * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils} instead.
 * This class is kept for backwards compatibility and will be removed in future versions.
 */
@Deprecated
public class SecurityUtils {

    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#isAdmin()} instead.
     */
    @Deprecated
    public static boolean isAdmin() {
        return com.itss.projectmanagement.security.SecurityUtils.isAdmin();
    }
    
    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#isInstructor()} instead.
     */
    @Deprecated
    public static boolean isInstructor() {
        return com.itss.projectmanagement.security.SecurityUtils.isInstructor();
    }
    
    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#isStudent()} instead.
     */
    @Deprecated
    public static boolean isStudent() {
        return com.itss.projectmanagement.security.SecurityUtils.isStudent();
    }
    
    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#isGroupLeader(GroupRepository, Long)} instead.
     */
    @Deprecated
    public static boolean isGroupLeader(GroupRepository groupRepository, Long groupId) {
        return com.itss.projectmanagement.security.SecurityUtils.isGroupLeader(groupRepository, groupId);
    }
    
    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#isAnyGroupLeader(GroupRepository, UserRepository)} instead.
     */
    @Deprecated
    public static boolean isAnyGroupLeader(GroupRepository groupRepository, UserRepository userRepository) {
        return com.itss.projectmanagement.security.SecurityUtils.isAnyGroupLeader(groupRepository, userRepository);
    }
    
    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#hasAuthority(String)} instead.
     */
    @Deprecated
    public static boolean hasAuthority(String authority) {
        return com.itss.projectmanagement.security.SecurityUtils.hasAuthority(authority);
    }
    
    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#hasAnyRole(Role...)} instead.
     */
    @Deprecated
    public static boolean hasAnyRole(Role... roles) {
        return com.itss.projectmanagement.security.SecurityUtils.hasAnyRole(roles);
    }
    
    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#getCurrentUsername()} instead.
     */
    @Deprecated
    public static String getCurrentUsername() {
        return com.itss.projectmanagement.security.SecurityUtils.getCurrentUsername();
    }
    
    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#getCurrentUser(UserRepository)} instead.
     */
    @Deprecated
    public static User getCurrentUser(UserRepository userRepository) {
        return com.itss.projectmanagement.security.SecurityUtils.getCurrentUser(userRepository);
    }
    
    /**
     * @deprecated Use {@link com.itss.projectmanagement.security.SecurityUtils#getCurrentUserId()} instead.
     */
    @Deprecated
    public static Long getCurrentUserId() {
        return com.itss.projectmanagement.security.SecurityUtils.getCurrentUserId();
    }
}