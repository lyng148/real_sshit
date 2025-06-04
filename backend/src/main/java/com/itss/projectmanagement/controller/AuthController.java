package com.itss.projectmanagement.controller;

import com.itss.projectmanagement.dto.request.auth.AuthRequest;
import com.itss.projectmanagement.dto.request.auth.RegisterRequest;
import com.itss.projectmanagement.dto.response.auth.AuthResponse;
import com.itss.projectmanagement.dto.response.auth.RegisterResponse;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.security.JwtTokenProvider;
import com.itss.projectmanagement.security.UserPrincipal;
import com.itss.projectmanagement.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for user authentication")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    @Autowired
    private IUserService userService;

    @Operation(summary = "Authenticate user", description = "Login with username and password to get JWT token")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Authentication successful",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = AuthResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication failed")
    })
    @PostMapping("/login")
    public ResponseEntity<com.itss.projectmanagement.dto.common.ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Get UserDetails (which is now UserPrincipal)
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        // Get the actual User entity
        User user;
        if (userDetails instanceof UserPrincipal) {
            user = ((UserPrincipal) userDetails).getUser();
        } else {
            // Fallback - shouldn't happen but just in case
            user = userService.getUserByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalStateException("User not found"));
        }
        
        String jwt = jwtTokenProvider.generateToken(userDetails);
        
        // Update last login timestamp
        userService.updateLastLogin(loginRequest.getUsername());

        AuthResponse authResponse = new AuthResponse(jwt, user);
        return ResponseEntity.ok(com.itss.projectmanagement.dto.common.ApiResponse.success(
                authResponse,
                "Authentication successful"
        ));
    }
    
    @Operation(summary = "Register a new user", description = "Register a new user with default STUDENT role")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = RegisterResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or username/email already exists")
    })
    @PostMapping("/register")
    public ResponseEntity<com.itss.projectmanagement.dto.common.ApiResponse<RegisterResponse>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = userService.register(
                registerRequest.getUsername(),
                registerRequest.getPassword(),
                registerRequest.getFullName(),
                registerRequest.getEmail()
        );
        
        RegisterResponse registerResponse = new RegisterResponse(
                "User registered successfully",
                true,
                user.getUsername()
        );
        
        com.itss.projectmanagement.dto.common.ApiResponse<RegisterResponse> response = 
                com.itss.projectmanagement.dto.common.ApiResponse.success(
                        registerResponse,
                        "User registered successfully"
                );
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}