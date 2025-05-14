package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.dto.response.chart.CommitCountChartDTO;
import com.itss.projectmanagement.dto.response.chart.ProgressTimelineChartDTO;
import com.itss.projectmanagement.dto.response.chart.ContributionPieChartDTO;
import com.itss.projectmanagement.entity.CommitRecord;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.ContributionScore;
import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.repository.CommitRecordRepository;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.TaskRepository;
import com.itss.projectmanagement.repository.ContributionScoreRepository;
import com.itss.projectmanagement.service.IChartService;
import com.itss.projectmanagement.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChartServiceImpl implements IChartService {
    private final CommitRecordRepository commitRecordRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    private final TaskRepository taskRepository;
    private final ContributionScoreRepository contributionScoreRepository;

    @Override
    public CommitCountChartDTO getCommitCountChart(Long projectId, String rangeType) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        // Get all groups in the project
        List<Group> groups = groupRepository.findByProject(project);
        
        // Calculate date range based on rangeType
        LocalDateTime startDate = calculateStartDate(rangeType);
        
        // Get all valid commits for all groups in the project within date range
        List<CommitRecord> commits = new ArrayList<>();
        for (Group group : groups) {
            List<CommitRecord> groupCommits = commitRecordRepository.findByGroupAndIsValidAndTimestampAfter(
                group, true, startDate);
            commits.addAll(groupCommits);
        }
        
        // Count commits grouped by task assignee
        return getCommitCountChartDTO(commits);
    }

    private static CommitCountChartDTO getCommitCountChartDTO(List<CommitRecord> commits) {
        Map<User, Long> commitCounts = new HashMap<>();
        for (CommitRecord commit : commits) {
            if (commit.getTask() != null && commit.getTask().getAssignee() != null) {
                User assignee = commit.getTask().getAssignee();
                commitCounts.put(assignee, commitCounts.getOrDefault(assignee, 0L) + 1);
            }
        }
        // Build DTO
        CommitCountChartDTO result = new CommitCountChartDTO();
        List<CommitCountChartDTO.MemberCommitCount> data = getMemberCommitCounts(commitCounts);
        result.setData(data);
        return result;
    }

    private static List<CommitCountChartDTO.MemberCommitCount> getMemberCommitCounts(Map<User, Long> commitCounts) {
        List<CommitCountChartDTO.MemberCommitCount> data = new ArrayList<>();
        for (Map.Entry<User, Long> entry : commitCounts.entrySet()) {
            User member = entry.getKey();
            CommitCountChartDTO.MemberCommitCount memberData = new CommitCountChartDTO.MemberCommitCount();
            memberData.setMemberId(member.getId());
            memberData.setMemberName(member.getFullName());
            memberData.setCommitCount(entry.getValue().intValue());
            data.add(memberData);
        }
        return data;
    }

    @Override
    public ProgressTimelineChartDTO getProgressTimelineChart(Long projectId, String rangeType) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        // Get all groups in the project
        List<Group> groups = groupRepository.findByProject(project);
        
        // Calculate date range based on rangeType
        LocalDateTime startDate = calculateStartDate(rangeType);
        LocalDateTime endDate = LocalDateTime.now();
        
        // Create a list of dates from startDate to endDate
        List<LocalDate> dateList = generateDateList(startDate.toLocalDate(), endDate.toLocalDate());
        
        // Get all tasks for all groups in the project
        List<Task> allTasks = new ArrayList<>();
        for (Group group : groups) {
            List<Task> groupTasks = taskRepository.findByGroup(group);
            allTasks.addAll(groupTasks);
        }
        
        // Calculate progress percentage for each date
        List<ProgressTimelineChartDTO.ProgressPoint> timeline = new ArrayList<>();
        for (LocalDate date : dateList) {
            double progressPercent = calculateProgressPercentForDate(allTasks, date);
            
            ProgressTimelineChartDTO.ProgressPoint point = new ProgressTimelineChartDTO.ProgressPoint();
            point.setDate(date.toString());
            point.setProgressPercent(progressPercent);
            timeline.add(point);
        }
        
        // Create and return the DTO
        ProgressTimelineChartDTO result = new ProgressTimelineChartDTO();
        result.setTimeline(timeline);
        return result;
    }

    @Override
    public ContributionPieChartDTO getContributionPieChart(Long projectId, String rangeType) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        // Get contribution scores for the project
        List<ContributionScore> contributionScores = contributionScoreRepository.findByProject(project);
        
        // Calculate date range based on rangeType if needed
        // For now, we'll use all contribution scores regardless of date
        
        // Calculate total score for percentage calculation
        double totalScore = contributionScores.stream()
            .mapToDouble(score -> score.getCalculatedScore() != null ? score.getCalculatedScore() : 0.0)
            .sum();
        
        // Create the DTO
        ContributionPieChartDTO result = new ContributionPieChartDTO();
        List<ContributionPieChartDTO.MemberContribution> data = new ArrayList<>();
        
        for (ContributionScore score : contributionScores) {
            ContributionPieChartDTO.MemberContribution memberData = getMemberContribution(score, totalScore);

            data.add(memberData);
        }
        
        result.setData(data);
        return result;
    }

    private static ContributionPieChartDTO.MemberContribution getMemberContribution(ContributionScore score, double totalScore) {
        ContributionPieChartDTO.MemberContribution memberData = new ContributionPieChartDTO.MemberContribution();
        memberData.setMemberId(score.getUser().getId());
        memberData.setMemberName(score.getUser().getFullName());

        // Calculate percentage
        double contributionPercent = 0;
        if (totalScore > 0 && score.getCalculatedScore() != null) {
            contributionPercent = (score.getCalculatedScore() / totalScore) * 100;
        }
        memberData.setContributionPercent(contributionPercent);
        return memberData;
    }

    // Helper method to calculate start date based on range type
    private LocalDateTime calculateStartDate(String rangeType) {
        LocalDateTime now = LocalDateTime.now();
        return switch (rangeType) {
            case "week" -> now.minusWeeks(1);
            case "month" -> now.minusMonths(1);
            default -> LocalDateTime.of(2025, 5, 1, 0, 0, 0, 0); // Start of May 2025
        };
    }
    
    // Helper method to generate a list of dates between start and end dates
    private List<LocalDate> generateDateList(LocalDate startDate, LocalDate endDate) {
        List<LocalDate> dateList = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            dateList.add(currentDate);
            currentDate = currentDate.plusDays(1);
        }
        return dateList;
    }
    
    // Helper method to calculate progress percentage for a specific date
    private double calculateProgressPercentForDate(List<Task> tasks, LocalDate date) {
        if (tasks.isEmpty()) {
            return 0.0;
        }
        
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream()
            .filter(task -> task.getStatus() == TaskStatus.COMPLETED && 
                   (task.getUpdatedAt() == null || 
                    task.getUpdatedAt().toLocalDate().isBefore(date) || 
                    task.getUpdatedAt().toLocalDate().isEqual(date)))
            .count();
        
        return (double) completedTasks / totalTasks * 100;
    }
}