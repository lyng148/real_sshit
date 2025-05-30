package com.itss.projectmanagement.dto.common;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationRequest {
    
    @Min(value = 0, message = "Page number must be non-negative")
    @Builder.Default
    private int page = 0;
    
    @Min(value = 1, message = "Page size must be positive")
    @Builder.Default
    private int size = 10;
    
    private String sortBy;

    @Builder.Default
    private String sortDirection = "ASC";
} 