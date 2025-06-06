package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.dto.common.PaginationResponse;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.enums.Role;
import com.itss.projectmanagement.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.itss.projectmanagement.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements IUserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get all users with pagination
     * @param page the page number
     * @param size the page size
     * @param sortBy the field to sort by
     * @param sortDirection the sort direction (ASC or DESC)
     * @return paginated list of users
     */
    @Override
    public PaginationResponse<User> getAllUsersPaginated(int page, int size, String sortBy, String sortDirection) {
        // Create sort direction
        Sort.Direction direction = "DESC".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        // Default sort by fullName if not specified
        if (sortBy == null || sortBy.trim().isEmpty()) {
            sortBy = "fullName";
        }
        
        // Create pageable
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        // Get paginated users
        Page<User> userPage = userRepository.findAll(pageable);
        
        // Create pagination metadata
        PaginationResponse.PaginationMeta meta = PaginationResponse.PaginationMeta.builder()
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .hasNext(userPage.hasNext())
                .hasPrevious(userPage.hasPrevious())
                .isFirst(userPage.isFirst())
                .isLast(userPage.isLast())
                .build();
        
        return PaginationResponse.<User>builder()
                .content(userPage.getContent())
                .pagination(meta)
                .build();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Register a new user with default STUDENT role
     * @param username Username
     * @param password Raw password
     * @param fullName Full name
     * @param email Email
     * @return The created user
     * @throws IllegalArgumentException if username or email already exists
     */
    public User register(String username, String password, String fullName, String email) {
        // Check if username already exists
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create new user with STUDENT role
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .email(email)
                .roles(Collections.singleton(Role.STUDENT))
                .enabled(true)
                .build();

        return userRepository.save(user);
    }

    public User updateUser(User user) {
        // Only encode password if it has been changed (not already encoded)
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public void updateLastLogin(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @Override
    public User getUserEntityById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}