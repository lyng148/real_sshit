package com.itss.projectmanagement.security;

import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.service.PeerReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import java.util.Arrays;
import java.util.List;

/**
 * Interceptor to check and redirect users if they have pending peer reviews to complete
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PeerReviewInterceptor implements HandlerInterceptor {

    private final PeerReviewService peerReviewService;
    
    // List of endpoints that are always accessible, even if peer reviews are pending
    private final List<String> allowedEndpoints = Arrays.asList(
            "/api/peer-reviews",
            "/api/peer-reviews/",
            "/api/peer-reviews/submit",
            "/api/peer-reviews/members-to-review",
            "/api/peer-reviews/completion-status",
            "/error"
    );
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Skip interceptor for OPTIONS requests (CORS preflight)
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }
        // Cho phép tất cả các request GET (phương thức đọc) truy cập
        if (request.getMethod().equalsIgnoreCase("GET")) {
            return true;
        }
        
        // Check if the requested path is in the allowed endpoints list
        String requestPath = request.getRequestURI();
        for (String allowedPath : allowedEndpoints) {
            if (requestPath.startsWith(allowedPath)) {
                return true;
            }
        }
        
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            // User not authenticated, let the security filters handle it
            return true;
        }
        
        // Extract user ID and check if user is a student, handling both User and UserPrincipal types
        Long userId = null;
        boolean isStudent = false;
        
        Object principal = authentication.getPrincipal();
        log.debug("Authentication principal type: {}", principal.getClass().getName());
        
        if (principal instanceof UserPrincipal userPrincipal) {
            userId = userPrincipal.getId();
            isStudent = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("STUDENT") || a.getAuthority().equals("ROLE_STUDENT"));
        } 
        else if (principal instanceof User user) {
            userId = user.getId();
            isStudent = user.getRoles().stream()
                .anyMatch(role -> role.toString().equals("STUDENT"));
        }
        else {
            // Unexpected principal type
            log.warn("Unexpected authentication principal type: {}", principal.getClass().getName());
            return true;
        }
        
        // Check if the student user has pending peer reviews
        if (isStudent && userId != null) {
            boolean hasPendingReviews = peerReviewService.hasPendingPeerReviews(userId);
            
            if (hasPendingReviews) {
                log.info("User with ID {} has pending peer reviews, redirecting to peer review page", userId);
                // Set response status to 403 (Forbidden) with a custom header for frontend to handle
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setHeader("X-Pending-Peer-Reviews", "true");
                response.setHeader("Access-Control-Expose-Headers", "X-Pending-Peer-Reviews");
                response.getWriter().write("{\"error\":\"pending_peer_reviews\",\"message\":\"You must complete all peer reviews before accessing other features\"}");
                return false;
            }
        }
        
        return true;
    }
    
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
                          ModelAndView modelAndView) throws Exception {
        // No post-handle operations needed
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                               Exception ex) throws Exception {
        // No after-completion operations needed
    }
}