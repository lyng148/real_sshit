package com.itss.projectmanagement.dto.response.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for project statistics endpoint
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatisticsDTO {

    private ProjectSummary projectSummary;
    private TaskStatistics taskStatistics;
    private ContributionStatistics contributionStatistics;
    private PeerReviewStatistics peerReviewStatistics;
    private PressureScoreAnalysis pressureScoreAnalysis;
    private TimeStatistics timeStatistics;

    /**
     * Project summary statistics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectSummary {
        private int totalGroups;
        private int totalStudents;
        private int avgGroupSize;
        private int completionRate;
    }

    /**
     * Task statistics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskStatistics {
        private int totalTasks;
        private TasksByStatus tasksByStatus;
        private String avgCompletionTime;
        private int onTimeCompletionRate;
        private TasksByDifficulty tasksByDifficulty;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class TasksByStatus {
            private int notStarted;
            private int inProgress;
            private int completed;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class TasksByDifficulty {
            private int easy;
            private int medium;
            private int hard;
        }
    }

    /**
     * Contribution statistics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContributionStatistics {
        private double avgContributionScore;
        private GroupDistribution groupDistribution;
        private List<Contributor> topContributors;
        private List<Contributor> lowContributors;
        private int freeRiderCount;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class GroupDistribution {
            private double min;
            private double max;
            private double median;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Contributor {
            private String studentId;
            private double score;
        }
    }

    /**
     * Peer review statistics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeerReviewStatistics {
        private double avgReviewScore;
        private int completionRate;
        private double correlationWithTasks;
    }

    /**
     * Pressure score analysis
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PressureScoreAnalysis {
        private int avgPressureScore;
        private int highPressureCount;
        private List<PressureTrendPoint> pressureTrend;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class PressureTrendPoint {
            private int week;
            private int avgScore;
        }
    }

    /**
     * Time-based statistics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeStatistics {
        private List<WeeklyActivity> weeklyActivity;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class WeeklyActivity {
            private int week;
            private int taskCount;
            private int commitCount;
        }
    }
}