package com.itss.projectmanagement.enums;

import lombok.Getter;

@Getter
public enum DifficultyLevel {
    EASY(1),
    MEDIUM(2),
    HARD(3);

    private final int value;
    
    DifficultyLevel(int value) {
        this.value = value;
    }

}