package com.itss.projectmanagement.service;

import com.itss.projectmanagement.entity.User;

import java.util.List;
import java.util.Optional;


public interface IUserService {
    List<User> getAllUsers();

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
}