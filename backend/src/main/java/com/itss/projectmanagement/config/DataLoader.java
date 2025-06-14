package com.itss.projectmanagement.config;

import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.enums.Role;
import com.itss.projectmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * DataLoader component để tạo các tài khoản mặc định khi ứng dụng khởi động
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createDefaultUsers();
    }

    private void createDefaultUsers() {
        log.info("Checking for default users...");

        // Kiểm tra xem đã có user nào trong database chưa
        if (userRepository.count() > 0) {
            log.info("Users already exist in database. Skipping default user creation.");
            return;
        }

        log.info("No users found. Creating default users...");

        try {
            // Tạo tài khoản ADMIN
            createUserIfNotExists(
                "admin", 
                "admin", 
                "Administrator", 
                "admin@projectmanagement.com", 
                Set.of(Role.ADMIN)
            );

            // Tạo tài khoản INSTRUCTOR (Người hướng dẫn)
            createUserIfNotExists(
                "giaovien", 
                "giaovien", 
                "Giáo Viên", 
                "giaovien@projectmanagement.com", 
                Set.of(Role.INSTRUCTOR)
            );

            // Tạo tài khoản STUDENT 1
            createUserIfNotExists(
                "sinhvien1", 
                "sinhvien1", 
                "Sinh Viên 1", 
                "sinhvien1@projectmanagement.com", 
                Set.of(Role.STUDENT)
            );

            // Tạo tài khoản STUDENT 2 (Nhóm trưởng)
            createUserIfNotExists(
                "sinhvien2", 
                "sinhvien2", 
                "Sinh Viên 2 (Nhóm trưởng)", 
                "sinhvien2@projectmanagement.com", 
                Set.of(Role.STUDENT)
            );

            log.info("✅ Default users created successfully!");
            log.info("📋 Login credentials:");
            log.info("   🔧 ADMIN: admin / admin");
            log.info("   👨‍🏫 INSTRUCTOR: giaovien / giaovien");
            log.info("   👨‍🎓 STUDENT 1: sinhvien1 / sinhvien1");
            log.info("   👨‍🎓 STUDENT 2 (Group Leader): sinhvien2 / sinhvien2");

        } catch (Exception e) {
            log.error("❌ Error creating default users: {}", e.getMessage(), e);
        }
    }

    private void createUserIfNotExists(String username, String password, String fullName, String email, Set<Role> roles) {
        if (!userRepository.existsByUsername(username)) {
            User user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .fullName(fullName)
                    .email(email)
                    .roles(roles)
                    .enabled(true)
                    .build();

            userRepository.save(user);
            log.info("✅ Created user: {} with roles: {}", username, roles);
        } else {
            log.info("⚠️ User {} already exists, skipping creation", username);
        }
    }
}

