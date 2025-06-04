package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.entity.PasswordResetToken;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.PasswordResetTokenRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.IEmailService;
import com.itss.projectmanagement.service.IPasswordService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordServiceImpl implements IPasswordService {
    
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final IEmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${app.password-reset.token.expiration}")
    private long tokenExpirationMs;
    
    private static final int MAX_RESET_ATTEMPTS_PER_HOUR = 3;
    
    @Override
    @Transactional
    public void initiatePasswordReset(String email) {
        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            log.warn("Password reset requested for non-existent email: {}", email);
            // Don't reveal if email exists or not for security
            return;
        }
        
        User user = userOptional.get();
        
        // Check rate limiting - max 3 attempts per hour
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentAttempts = passwordResetTokenRepository.countRecentTokensByUser(user, oneHourAgo);
        
        if (recentAttempts >= MAX_RESET_ATTEMPTS_PER_HOUR) {
            log.warn("Too many password reset attempts for user: {}", email);
            throw new IllegalArgumentException("Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.");
        }
        
        // Delete existing tokens for this user
        passwordResetTokenRepository.deleteByUser(user);
        
        // Generate new token
        String token = UUID.randomUUID().toString();
        
        // Create and save password reset token
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusNanos(tokenExpirationMs * 1_000_000))
                .build();
        
        passwordResetTokenRepository.save(resetToken);
        
        // Send password reset email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
        }
    }
    
    @Override
    @Transactional
    public void resetPasswordWithToken(String token, String newPassword) {
        // Find token
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByTokenAndUsedFalse(token);
        
        if (tokenOptional.isEmpty()) {
            log.warn("Invalid or already used password reset token: {}", token);
            throw new IllegalArgumentException("Token không hợp lệ hoặc đã được sử dụng.");
        }
        
        PasswordResetToken resetToken = tokenOptional.get();
        
        // Check if token is expired
        if (resetToken.isExpired()) {
            log.warn("Expired password reset token: {}", token);
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.");
        }
        
        // Validate new password
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }
        
        // Update user password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        
        log.info("Password reset successfully for user: {}", user.getEmail());
    }
    
    @Override
    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        // Validate current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            log.warn("Incorrect current password for user: {}", user.getEmail());
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng.");
        }
        
        // Validate new password
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }
        
        // Check if new password is different from current
        if (passwordEncoder.matches(newPassword.trim(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới phải khác với mật khẩu hiện tại.");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", user.getEmail());
    }
    
    @Override
    public boolean isPasswordResetTokenValid(String token) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByTokenAndUsedFalse(token);
        
        if (tokenOptional.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOptional.get();
        return !resetToken.isExpired();
    }
    
    /**
     * Clean up expired tokens (can be called by a scheduler)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Cleaned up expired password reset tokens");
    }
} 