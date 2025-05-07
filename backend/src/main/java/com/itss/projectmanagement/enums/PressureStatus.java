package com.itss.projectmanagement.enums;

/**
 * Represents the pressure status of a user based on their Total Member Pressure Score (TMPS)
 * relative to the project's pressure threshold
 */
public enum PressureStatus {
    SAFE("Safe"),         // TMPS < 70% of threshold
    AT_RISK("At risk"),   // 70% of threshold <= TMPS < threshold
    OVERLOADED("Overloaded");   // TMPS >= threshold
    
    private final String description;
    
    PressureStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}