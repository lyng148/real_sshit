package com.itss.projectmanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            log.debug("Processing request: {}", request.getRequestURI());
            String jwt = getJwtFromRequest(request);
            log.debug("JWT token: {}", jwt != null ? (jwt.length() > 10 ? jwt.substring(0, 10) + "..." : jwt) : "null");

            if (StringUtils.hasText(jwt)) {
                log.debug("Processing token for request: " + request.getRequestURI());
                boolean isValid = jwtTokenProvider.isTokenValid(jwt);
                log.debug("Token is valid: " + isValid);
                
                if (isValid) {
                    String username = jwtTokenProvider.getUsernameFromToken(jwt);
                    log.debug("Username from token: " + username);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    log.debug("User authorities: " + userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Authentication set in SecurityContextHolder");
                } else {
                    log.warn("Invalid JWT token: {}", jwt);
                }
            } else {
                log.debug("No JWT token found in request");
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        log.debug("Authorization header: {}", bearerToken != null ? 
            (bearerToken.length() > 15 ? bearerToken.substring(0, 15) + "..." : bearerToken) : "null");
            
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}