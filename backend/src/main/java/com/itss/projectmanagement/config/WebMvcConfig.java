package com.itss.projectmanagement.config;

import com.itss.projectmanagement.security.PeerReviewInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final PeerReviewInterceptor peerReviewInterceptor;
    
    @Value("${ngrok.enabled:false}")
    private boolean ngrokEnabled;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(peerReviewInterceptor)
                .addPathPatterns("/api/**") // Apply to all API endpoints
                .excludePathPatterns("/api/auth/login", "/api/auth/refresh", "/api/ngrok/**"); // Exclude auth and ngrok endpoints
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (ngrokEnabled) {
            // When ngrok is enabled, allow all origins to support dynamic tunnel URLs
            registry.addMapping("/**")
                    .allowedOriginPatterns("*") // Use patterns to support ngrok's dynamic subdomains
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true) // Enable credentials for ngrok tunnels
                    .maxAge(3600);
        } else {
            // Default CORS configuration for local development
            registry.addMapping("/**")
                    .allowedOrigins(
                            "http://localhost:3000",
                            "http://localhost:8081", 
                            "http://127.0.0.1:3000",
                            "http://127.0.0.1:8081"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
        }
    }
}