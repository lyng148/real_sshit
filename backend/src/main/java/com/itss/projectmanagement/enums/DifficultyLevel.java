package com.itss.projectmanagement.enums;

public enum DifficultyLevel {
    EASY(1),
    MEDIUM(2),
    HARD(3);
    
    private final int value;
    
    DifficultyLevel(int value) {
        this.value = value;
    }
    
    public int getValue() {
        return value;
    }
}