package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.AuthRequest;
import com.itss.projectmanagement.dto.AuthResponse;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.security.JwtTokenProvider;
import com.itss.projectmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken((User) authentication.getPrincipal());
        
        // Update last login timestamp
        userService.updateLastLogin(loginRequest.getUsername());

        return ResponseEntity.ok(new AuthResponse(jwt));
    }
}