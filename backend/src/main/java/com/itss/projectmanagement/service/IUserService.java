package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.common.PaginationResponse;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;


public interface IUserService {
    List<User> getAllUsers();

    /**
     * Get all users with pagination
     * @param page the page number
     * @param size the page size
     * @param sortBy the field to sort by
     * @param sortDirection the sort direction (ASC or DESC)
     * @return paginated list of users
     */
    PaginationResponse<User> getAllUsersPaginated(int page, int size, String sortBy, String sortDirection);

    Optional<User> getUserById(Long id);

    Optional<User> getUserByUsername(String username);

    User createUser(User user);
    
    /**
     * Register a new user with default STUDENT role
     * @param username Username
     * @param password Raw password
     * @param fullName Full name
     * @param email Email
     * @return The created user
     * @throws IllegalArgumentException if username or email already exists
     */
    User register(String username, String password, String fullName, String email);

    User updateUser(User user);

    void deleteUser(Long id);

    void updateLastLogin(String username);

    /**
     * Get user entity by ID (for internal service use)
     * @param userId The user ID
     * @return The user entity
     * @throws ResourceNotFoundException if user not found
     */
    User getUserEntityById(Long userId);
}