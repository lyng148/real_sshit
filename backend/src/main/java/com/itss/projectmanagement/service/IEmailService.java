package com.itss.projectmanagement.service;

public interface IEmailService {
    
    /**
     * Send a simple text email
     * 
     * @param to The recipient email address
     * @param subject The email subject
     * @param text The email content
     */
    void sendSimpleEmail(String to, String subject, String text);
    
    /**
     * Send an HTML email
     * 
     * @param to The recipient email address
     * @param subject The email subject
     * @param htmlContent The HTML email content
     */
    void sendHtmlEmail(String to, String subject, String htmlContent);
    
    /**
     * Send password reset email
     * 
     * @param to The recipient email address
     * @param fullName The user's full name
     * @param resetToken The password reset token
     */
    void sendPasswordResetEmail(String to, String fullName, String resetToken);
} 