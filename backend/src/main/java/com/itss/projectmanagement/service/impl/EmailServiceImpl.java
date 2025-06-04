package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.service.IEmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements IEmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @Override
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }
    
    @Override
    public void sendPasswordResetEmail(String to, String fullName, String resetToken) {
        String subject = "Đặt lại mật khẩu - Project Management System";
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
        
        String htmlContent = buildPasswordResetEmailTemplate(fullName, resetUrl);
        
        sendHtmlEmail(to, subject, htmlContent);
        log.info("Password reset email sent to: {}", to);
    }

    private String buildPasswordResetEmailTemplate(String fullName, String resetUrl) {
        return "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "    <title>Đặt lại mật khẩu</title>" +
                "    <style>" +
                "        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; background-color: #ffffff; padding: 40px; margin: 0; }" +
                "        .container { max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 12px; box-shadow: 0 6px 10px rgba(0, 0, 0, 0.05); border: 1px solid #eaeaea; }" +
                "        h1 { font-size: 24px; font-weight: 500; margin-bottom: 16px; }" +
                "        p { font-size: 16px; line-height: 1.6; margin-bottom: 20px; }" +
                "        .button { background-color: #007aff; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: 500; }" +
                "        .button:hover { background-color: #005ecb; }" +
                "        .footer { color: #999; font-size: 14px; text-align: center; margin-top: 30px; }" +
                "        .link-box { word-break: break-all; background-color: #f7f7f7; padding: 10px; border-radius: 8px; font-size: 14px; color: #555; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <h1>Đặt lại mật khẩu của bạn</h1>" +
                "        <p>Xin chào " + fullName + ",</p>" +
                "        <p>Bạn vừa gửi yêu cầu đặt lại mật khẩu cho tài khoản tại Project Management System. Để tiếp tục, vui lòng nhấn vào nút dưới đây:</p>" +
                "        <div style='text-align:center; margin:30px 0;'>" +
                "            <a href='" + resetUrl + "' class='button'>Đặt lại mật khẩu</a>" +
                "        </div>" +
                "        <p>Nếu nút trên không hoạt động, hãy sao chép đường dẫn sau và dán vào trình duyệt:</p>" +
                "        <p class='link-box'>" + resetUrl + "</p>" +
                "        <p style='font-size:14px;color:#666;'>Link có hiệu lực trong vòng 1 giờ. Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.</p>" +
                "        <p style='margin-top:40px;'>Trân trọng,<br>Đội ngũ Project Management System</p>" +
                "    </div>" +
                "    <div class='footer'>" +
                "        Email này được gửi tự động, vui lòng không trả lời.<br>&copy; 2024 Project Management System. All rights reserved." +
                "    </div>" +
                "</body>" +
                "</html>";
    }
} 