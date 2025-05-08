package com.itss.projectmanagement.utils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class DateUtils {

    /**
     * Calculate the number of weeks between two dates
     * @param start The start date
     * @param end The end date
     * @return Number of weeks between the dates
     */
    public static int getWeeksBetween(LocalDateTime start, LocalDateTime end) {
        // Calculate the number of days between two dates
        long days = ChronoUnit.DAYS.between(start, end);
        
        // Convert days to weeks (integer division)
        return (int) (days / 7);
    }
}