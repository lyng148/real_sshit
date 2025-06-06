package com.itss.projectmanagement.utils;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Utility class for score normalization using Min-Max scaling
 * Normalizes scores to 0-10 scale within groups for fair comparison
 */
@Slf4j
public class ScoreNormalizationUtils {
    
    private static final double TARGET_MIN = 0.0;
    private static final double TARGET_MAX = 10.0;
    private static final double EPSILON = 1e-9; // Small value to avoid division by zero
    
    /**
     * Normalize a list of scores using Min-Max scaling to 0-10 range
     * Returns normalized scores in the same order as input
     * This avoids the duplicate key issue when multiple users have the same raw score
     * 
     * @param scores List of raw scores to normalize (preserves order)
     * @return List of normalized scores (0-10) in same order as input
     */
    public static List<Double> normalizeScoresAsList(List<Double> scores) {
        if (scores == null || scores.isEmpty()) {
            log.warn("Empty or null scores list provided for normalization");
            return List.of();
        }
        
        // Handle single score case
        if (scores.size() == 1) {
            log.info("Single score normalization: {} -> {}", scores.get(0), TARGET_MAX);
            return List.of(TARGET_MAX);
        }
        
        // Find min and max values
        double min = scores.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
        double max = scores.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        
        log.debug("Score normalization: min={}, max={}, count={}", min, max, scores.size());
        
        // Handle case where all scores are the same
        if (Math.abs(max - min) < EPSILON) {
            log.info("All scores are equal ({}), assigning maximum normalized value", min);
            return scores.stream()
                    .map(score -> TARGET_MAX)
                    .collect(Collectors.toList());
        }
        
        // Apply Min-Max scaling while preserving order
        return scores.stream()
                .map(score -> normalizeValue(score, min, max))
                .collect(Collectors.toList());
    }
    
    /**
     * Normalize a list of scores using Min-Max scaling to 0-10 range
     * Formula: normalized = ((value - min) / (max - min)) * 10
     * 
     * @param scores List of raw scores to normalize
     * @return Map of original score to normalized score (0-10)
     * @deprecated Use normalizeScoresAsList to avoid duplicate key issues
     */
    @Deprecated
    public static Map<Double, Double> normalizeScores(List<Double> scores) {
        if (scores == null || scores.isEmpty()) {
            log.warn("Empty or null scores list provided for normalization");
            return Map.of();
        }
        
        // Handle single score case
        if (scores.size() == 1) {
            Double singleScore = scores.get(0);
            // If only one score, give it the maximum normalized value
            log.info("Single score normalization: {} -> {}", singleScore, TARGET_MAX);
            return Map.of(singleScore, TARGET_MAX);
        }
        
        // Find min and max values
        double min = scores.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
        double max = scores.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        
        log.debug("Score normalization: min={}, max={}, count={}", min, max, scores.size());
        
        // Handle case where all scores are the same
        if (Math.abs(max - min) < EPSILON) {
            log.info("All scores are equal ({}), assigning maximum normalized value", min);
            return scores.stream()
                    .distinct()
                    .collect(Collectors.toMap(score -> score, score -> TARGET_MAX));
        }
        
        // Apply Min-Max scaling
        return scores.stream()
                .distinct()
                .collect(Collectors.toMap(
                    score -> score,
                    score -> normalizeValue(score, min, max)
                ));
    }
    
    /**
     * Normalize a single value using Min-Max scaling
     * 
     * @param value Original value
     * @param min Minimum value in the dataset
     * @param max Maximum value in the dataset
     * @return Normalized value (0-10)
     */
    public static double normalizeValue(double value, double min, double max) {
        if (Math.abs(max - min) < EPSILON) {
            return TARGET_MAX; // If min == max, return max normalized value
        }
        
        double normalized = ((value - min) / (max - min)) * (TARGET_MAX - TARGET_MIN) + TARGET_MIN;
        
        // Ensure the result is within bounds (handle floating point precision issues)
        normalized = Math.max(TARGET_MIN, Math.min(TARGET_MAX, normalized));
        
        log.trace("Normalized {} (range [{}, {}]) -> {}", value, min, max, normalized);
        return normalized;
    }
    
    /**
     * Normalize scores within groups (e.g., by project or group)
     * Each group gets its own min-max scaling
     * 
     * @param scoresByGroup Map of group identifier to list of scores
     * @return Map of group identifier to normalized scores map
     */
    public static <T> Map<T, Map<Double, Double>> normalizeScoresByGroup(Map<T, List<Double>> scoresByGroup) {
        return scoresByGroup.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> {
                        log.debug("Normalizing scores for group {}: {} scores", 
                                entry.getKey(), entry.getValue().size());
                        return normalizeScores(entry.getValue());
                    }
                ));
    }
    
    /**
     * Calculate stats for a list of scores
     * Useful for debugging and validation
     */
    public static ScoreStats calculateStats(List<Double> scores) {
        if (scores == null || scores.isEmpty()) {
            return new ScoreStats(0.0, 0.0, 0.0, 0);
        }
        
        double min = scores.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
        double max = scores.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        double avg = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        
        return new ScoreStats(min, max, avg, scores.size());
    }
    
    /**
     * Data class for score statistics
     */
    public static class ScoreStats {
        public final double min;
        public final double max;
        public final double average;
        public final int count;
        
        public ScoreStats(double min, double max, double average, int count) {
            this.min = min;
            this.max = max;
            this.average = average;
            this.count = count;
        }
        
        @Override
        public String toString() {
            return String.format("ScoreStats{min=%.2f, max=%.2f, avg=%.2f, count=%d}", 
                    min, max, average, count);
        }
    }
} 