package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.dto.response.contribution.ContributionScoreResponse;
import com.itss.projectmanagement.dto.response.project.ProjectStatisticsDTO;
import com.itss.projectmanagement.dto.response.project.ProjectStatisticsDTO.*;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.repository.*;
import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.enums.DifficultyLevel;
import com.itss.projectmanagement.service.*;
import com.itss.projectmanagement.utils.DateUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsServiceImpl implements IStatisticsService {
    @Autowired
    private IProjectService projectService;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private IContributionScoreService contributionScoreService;
    @Autowired
    private IPressureScoreService pressureScoreService;
    @Autowired
    private IPeerReviewService peerReviewService;
    @Autowired
    private IGitHubService gitHubService;

    public ProjectStatisticsDTO getProjectStatistics(Long projectId) {
        Project project = projectService.getProjectById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        return ProjectStatisticsDTO.builder()
                .projectSummary(createProjectSummary(project))
                .taskStatistics(createTaskStatistics(project))
                .contributionStatistics(createContributionStatistics(project))
                .peerReviewStatistics(createPeerReviewStatistics(project))
                .pressureScoreAnalysis(createPressureScoreAnalysis(project))
                .timeStatistics(createTimeStatistics(project))
                .build();
    }

    private ProjectSummary createProjectSummary(Project project) {
        List<Group> groups = groupRepository.findByProject(project);
        int totalGroups = groups.size();

        // Calculate total students (unique members across all groups)
        Set<User> uniqueStudents = new HashSet<>();
        for (Group group : groups) {
            uniqueStudents.addAll(group.getMembers());
        }
        int totalStudents = uniqueStudents.size();

        // Calculate average group size
        int avgGroupSize = totalGroups > 0 ? Math.round((float) totalStudents / totalGroups) : 0;

        // Calculate completion rate based on tasks
        List<Task> allTasks = taskRepository.findByProject(project);
        long completedTasks = allTasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                .count();
        int completionRate = allTasks.isEmpty() ? 0 : (int) (completedTasks * 100 / allTasks.size());

        return ProjectSummary.builder()
                .totalGroups(totalGroups)
                .totalStudents(totalStudents)
                .avgGroupSize(avgGroupSize)
                .completionRate(completionRate)
                .build();
    }

    private TaskStatistics createTaskStatistics(Project project) {
        List<Task> allTasks = taskRepository.findByProject(project);

        // Count tasks by status
        Map<TaskStatus, Long> taskStatusCounts = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));

        TaskStatistics.TasksByStatus statusCounts = TaskStatistics.TasksByStatus.builder()
                .notStarted(taskStatusCounts.getOrDefault(TaskStatus.NOT_STARTED, 0L).intValue())
                .inProgress(taskStatusCounts.getOrDefault(TaskStatus.IN_PROGRESS, 0L).intValue())
                .completed(taskStatusCounts.getOrDefault(TaskStatus.COMPLETED, 0L).intValue())
                .build();

        // Count tasks by difficulty
        Map<DifficultyLevel, Long> difficultyCountMap = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getDifficulty, Collectors.counting()));

        TaskStatistics.TasksByDifficulty difficultyCount = TaskStatistics.TasksByDifficulty.builder()
                .easy(difficultyCountMap.getOrDefault(DifficultyLevel.EASY, 0L).intValue())
                .medium(difficultyCountMap.getOrDefault(DifficultyLevel.MEDIUM, 0L).intValue())
                .hard(difficultyCountMap.getOrDefault(DifficultyLevel.HARD, 0L).intValue())
                .build();

        // Calculate average completion time for completed tasks
        OptionalDouble avgDays = allTasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.COMPLETED && task.getCompletedAt() != null && task.getCreatedAt() != null)
                .mapToLong(task -> ChronoUnit.DAYS.between(task.getCreatedAt(), task.getCompletedAt()))
                .average();

        String avgCompletionTime = avgDays.isPresent() ?
                Math.round(avgDays.getAsDouble()) + " days" : "N/A";

        // Calculate on-time completion rate
        long onTimeCount = allTasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.COMPLETED &&
                        task.getDeadline() != null &&
                        task.getCompletedAt() != null &&
                        !task.getCompletedAt().isAfter(task.getDeadline().atStartOfDay()))
                .count();

        int onTimeRate = (int) (allTasks.stream().anyMatch(task -> task.getStatus() == TaskStatus.COMPLETED) ?
                (onTimeCount * 100 / allTasks.stream()
                        .filter(task -> task.getStatus() == TaskStatus.COMPLETED)
                        .count()) : 0);

        return TaskStatistics.builder()
                .totalTasks(allTasks.size())
                .tasksByStatus(statusCounts)
                .avgCompletionTime(avgCompletionTime)
                .onTimeCompletionRate(onTimeRate)
                .tasksByDifficulty(difficultyCount)
                .build();
    }

    private ContributionStatistics createContributionStatistics(Project project) {
        List<Group> projectGroups = groupRepository.findByProject(project);

        // Get contribution scores for all students in the project
        Map<String, Double> studentScores = new HashMap<>();        
        for (Group group : projectGroups) {
            for (User student : group.getMembers()) {
                ContributionScoreResponse score = contributionScoreService.getScoreByUserAndProject(student, project);
                // Use adjustedScore if it exists, otherwise use calculatedScore
                Double contributionScore = score.getAdjustedScore() != null && score.getAdjustedScore() > 0 
                    ? score.getAdjustedScore() 
                    : score.getCalculatedScore();
                studentScores.put(student.getUsername(), contributionScore);
            }
        }

        // Calculate average contribution score
        OptionalDouble avgScore = studentScores.values().stream()
                .mapToDouble(Double::doubleValue)
                .average();
        double avgContributionScore = avgScore.isPresent() ? avgScore.getAsDouble() : 0;

        // Calculate group distribution (min, max, median)
        List<Double> scores = new ArrayList<>(studentScores.values());
        Collections.sort(scores);

        double min = scores.isEmpty() ? 0 : scores.get(0);
        double max = scores.isEmpty() ? 0 : scores.get(scores.size() - 1);
        double median = scores.isEmpty() ? 0 : scores.get(scores.size() / 2);

        // Find top and low contributors
        List<Map.Entry<String, Double>> sortedEntries = new ArrayList<>(studentScores.entrySet());
        sortedEntries.sort(Map.Entry.comparingByValue(Comparator.reverseOrder()));

        List<ContributionStatistics.Contributor> topContributors = sortedEntries.stream()
                .limit(2)
                .map(entry -> ContributionStatistics.Contributor.builder()
                        .studentId(entry.getKey())
                        .score(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        Collections.reverse(sortedEntries);

        List<ContributionStatistics.Contributor> lowContributors = sortedEntries.stream()
                .limit(2)
                .map(entry -> ContributionStatistics.Contributor.builder()
                        .studentId(entry.getKey())
                        .score(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        // Count free riders - Check if score is below threshold * group average
        // Get threshold value from project (a value between 0-1)
        double threshold = project.getFreeriderThreshold() != null ? project.getFreeriderThreshold() : 0.5;

        // Calculate threshold score based on group average
        double freeRiderThresholdScore = threshold * avgContributionScore;

        // Count users whose score is below the threshold score
        long freeRiderCount = studentScores.values().stream()
                .filter(score -> score < freeRiderThresholdScore)
                .count();

        return ContributionStatistics.builder()
                .avgContributionScore(avgContributionScore)
                .groupDistribution(ContributionStatistics.GroupDistribution.builder()
                        .min(min)
                        .max(max)
                        .median(median)
                        .build())
                .topContributors(topContributors)
                .lowContributors(lowContributors)
                .freeRiderCount((int) freeRiderCount)
                .build();
    }

    private PeerReviewStatistics createPeerReviewStatistics(Project project) {
        // Get review scores
        double avgReviewScore = peerReviewService.getAverageReviewScore(project.getId());
        int completionRate = peerReviewService.getReviewCompletionRate(project.getId());
        double correlation = peerReviewService.getCorrelationWithTaskCompletion(project.getId());

        return PeerReviewStatistics.builder()
                .avgReviewScore(avgReviewScore)
                .completionRate(completionRate)
                .correlationWithTasks(correlation)
                .build();
    }

    private PressureScoreAnalysis createPressureScoreAnalysis(Project project) {
        List<Group> groups = groupRepository.findByProject(project);
        List<User> allStudents = new ArrayList<>();

        for (Group group : groups) {
            allStudents.addAll(group.getMembers());
        }

        // Calculate average pressure score
        int totalPressure = 0;
        int highPressureCount = 0;
        for (User student : allStudents) {
            int pressureScore = pressureScoreService.calculatePressureScore(student.getId(), project.getId());
            totalPressure += pressureScore;

            if (pressureScore > project.getPressureThreshold()) {
                highPressureCount++;
            }
        }

        int avgPressureScore = allStudents.isEmpty() ? 0 : totalPressure / allStudents.size();

        // Get pressure trend over weeks
        Map<Integer, List<Integer>> weeklyPressureScores = new HashMap<>();

        // Get project start date
        LocalDateTime projectStart = project.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();

        // Calculate week numbers since project start
        for (User student : allStudents) {
            // Get pressure score history
            Map<LocalDateTime, Integer> pressureHistory = pressureScoreService.getPressureScoreHistory(student.getId(), project.getId());

            for (Map.Entry<LocalDateTime, Integer> entry : pressureHistory.entrySet()) {
                int weekNumber = DateUtils.getWeeksBetween(projectStart, entry.getKey()) + 1;

                weeklyPressureScores.computeIfAbsent(weekNumber, k -> new ArrayList<>())
                        .add(entry.getValue());
            }
        }

        // Calculate average pressure score for each week
        List<PressureScoreAnalysis.PressureTrendPoint> pressureTrend = new ArrayList<>();
        for (int week = 1; week <= 3; week++) {
            List<Integer> weekScores = weeklyPressureScores.getOrDefault(week, Collections.emptyList());
            int avgScore = weekScores.isEmpty() ? 0 :
                    weekScores.stream().mapToInt(Integer::intValue).sum() / weekScores.size();

            pressureTrend.add(PressureScoreAnalysis.PressureTrendPoint.builder()
                    .week(week)
                    .avgScore(avgScore)
                    .build());
        }

        return PressureScoreAnalysis.builder()
                .avgPressureScore(avgPressureScore)
                .highPressureCount(highPressureCount)
                .pressureTrend(pressureTrend)
                .build();
    }

    private TimeStatistics createTimeStatistics(Project project) {
        // Get weekly activity for the project (tasks and commits)
        LocalDateTime projectStart = project.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();

        List<TimeStatistics.WeeklyActivity> weeklyActivities = new ArrayList<>();

        for (int week = 1; week <= 3; week++) {
            // Calculate date range for this week
            LocalDateTime weekStart = projectStart.plusWeeks(week - 1);
            LocalDateTime weekEnd = projectStart.plusWeeks(week);

            // Count tasks created in this week
            long taskCount = taskRepository.findByProjectAndCreatedAtBetween(
                    project, weekStart, weekEnd).size();

            // Count commits in this week
            int commitCount = gitHubService.getCommitCountInDateRange(project.getId(), weekStart, weekEnd);

            weeklyActivities.add(TimeStatistics.WeeklyActivity.builder()
                    .week(week)
                    .taskCount((int) taskCount)
                    .commitCount(commitCount)
                    .build());
        }

        return TimeStatistics.builder()
                .weeklyActivity(weeklyActivities)
                .build();
    }
}