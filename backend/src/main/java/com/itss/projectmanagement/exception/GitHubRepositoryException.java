package com.itss.projectmanagement.exception;

public class GitHubRepositoryException extends RuntimeException {
    
    public GitHubRepositoryException(String message) {
        super(message);
    }
    
    public GitHubRepositoryException(String message, Throwable cause) {
        super(message, cause);
    }
} 