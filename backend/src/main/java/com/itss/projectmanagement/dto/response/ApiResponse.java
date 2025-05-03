package com.itss.projectmanagement.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Map<String, Object> metadata;
    private LocalDateTime timestamp;
    private int status;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Operation completed successfully")
                .data(data)
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.OK.value())
                .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.OK.value())
                .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String message, Map<String, Object> metadata) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .metadata(metadata)
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.OK.value())
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message, HttpStatus status) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message, HttpStatus status, Map<String, Object> metadata) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .metadata(metadata)
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .build();
    }
}