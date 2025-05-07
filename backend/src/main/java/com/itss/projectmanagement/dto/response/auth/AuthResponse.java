package com.itss.projectmanagement.dto.response.auth;

import com.itss.projectmanagement.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private User user;
    
    public AuthResponse(String token) {
        this.token = token;
    }
}