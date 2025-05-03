package com.itss.projectmanagement.config;

import org.kohsuke.github.GitHub;
import org.kohsuke.github.GitHubBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class GitHubConfig {

    @Value("${github.token:}")
    private String githubToken;

    @Value("${github.username:}")
    private String githubUsername;

    @Value("${github.password:}")
    private String githubPassword;

    /**
     * Creates a GitHub client instance for API access
     * Can authenticate with either a personal access token or username/password
     */
    @Bean
    public GitHub gitHub() throws IOException {
        GitHubBuilder builder = new GitHubBuilder();
        
        if (!githubToken.isEmpty()) {
            // Prefer token-based authentication if available
            return builder.withOAuthToken(githubToken).build();
        } else if (!githubUsername.isEmpty() && !githubPassword.isEmpty()) {
            // Fall back to username/password if configured
            return builder.withPassword(githubUsername, githubPassword).build();
        } else {
            // Use anonymous access as last resort (rate limited)
            return builder.build();
        }
    }
}