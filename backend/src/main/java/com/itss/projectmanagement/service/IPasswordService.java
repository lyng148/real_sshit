package com.itss.projectmanagement.service;

import com.itss.projectmanagement.entity.User;

public interface IPasswordService {
    
    /**
     * Initiate password reset process by sending email with reset token
     * 
     * @param email The user's email address
     * @throws IllegalArgumentException if email is not found
     */
    void initiatePasswordReset(String email);
    
    /**
     * Reset password using reset token
     * 
     * @param token The password reset token
     * @param newPassword The new password
     * @throws IllegalArgumentException if token is invalid, expired, or already used
     */
    void resetPasswordWithToken(String token, String newPassword);
    
    /**
     * Change password for authenticated user
     * 
     * @param user The authenticated user
     * @param currentPassword The current password
     * @param newPassword The new password
     * @throws IllegalArgumentException if current password is incorrect
     */
    void changePassword(User user, String currentPassword, String newPassword);
    
    /**
     * Validate password reset token
     * 
     * @param token The password reset token
     * @return true if token is valid and not expired
     */
    boolean isPasswordResetTokenValid(String token);
} 