package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.dto.response.report.ProjectReportDTO;
import com.itss.projectmanagement.entity.CommitRecord;
import com.itss.projectmanagement.entity.ContributionScore;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.Task;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.exception.ResourceNotFoundException;
import com.itss.projectmanagement.repository.CommitRecordRepository;
import com.itss.projectmanagement.repository.ContributionScoreRepository;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.PeerReviewRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.TaskRepository;
import com.itss.projectmanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    private final TaskRepository taskRepository;
    private final CommitRecordRepository commitRecordRepository;
    private final ContributionScoreRepository contributionScoreRepository;
    private final PeerReviewRepository peerReviewRepository;

    @Override
    public ProjectReportDTO getProjectReport(Long projectId) {
        // Fetch project
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        // Create the report DTO
        ProjectReportDTO report = new ProjectReportDTO();
        report.setProjectId(project.getId());
        report.setProjectName(project.getName());
        
        // Get all groups in the project
        List<Group> groups = groupRepository.findByProject(project);
        
        // Find all members in the project groups
        List<User> allMembers = new ArrayList<>();
        for (Group group : groups) {
            allMembers.addAll(group.getMembers());
        }
        
        // Remove duplicates (in case a user is in multiple groups)
        // actually a user can only join one group in a project
        List<User> uniqueMembers = allMembers.stream()
            .distinct()
            .toList();
        
        // Prepare member reports
        List<ProjectReportDTO.MemberReport> memberReports = new ArrayList<>();
        
        for (User member : uniqueMembers) {
            ProjectReportDTO.MemberReport memberReport = new ProjectReportDTO.MemberReport();
            memberReport.setMemberId(member.getId());
            memberReport.setMemberName(member.getFullName());
            
            // Get contribution score
            ContributionScore score = contributionScoreRepository
                .findByUserAndProject(member, project)
                .orElse(null);
            
            if (score != null) {
                memberReport.setContributionScore(score.getCalculatedScore() != null ? 
                    score.getCalculatedScore() : 0.0);
            } else {
                memberReport.setContributionScore(0.0);
            }
            
            // Count commits
            Long commitCount = countCommitsForMember(member, groups);
            memberReport.setCommitCount(commitCount != null ? commitCount.intValue() : 0);
            
            // Count completed and late tasks
            Map<String, Integer> taskCounts = countTasksForMember(member, groups);
            memberReport.setCompletedTasks(taskCounts.get("completed"));
            memberReport.setLateTasks(taskCounts.get("late"));
            
            // Get peer review average
            Double peerReviewAvg = peerReviewRepository.findAverageScoreByRevieweeAndProject(member, project);
            memberReport.setPeerReviewAvg(peerReviewAvg != null ? peerReviewAvg : 0.0);
            
            memberReports.add(memberReport);
        }
        
        report.setMembers(memberReports);
        return report;
    }
    
    private Long countCommitsForMember(User member, List<Group> groups) {
        long count = 0L;
        // Count commits by task assignee
        for (Group group : groups) {
            List<CommitRecord> groupCommits = commitRecordRepository.findByGroupAndIsValid(group, true);
            for (CommitRecord commit : groupCommits) {
                if (commit.getTask() != null && commit.getTask().getAssignee() != null &&
                    commit.getTask().getAssignee().getId().equals(member.getId())) {
                    count++;
                }
            }
        }
        return count;
    }
    
    private Map<String, Integer> countTasksForMember(User member, List<Group> groups) {
        int completedCount = 0;
        int lateCount = 0;
        
        // Get all tasks for all groups
        for (Group group : groups) {
            List<Task> tasks = taskRepository.findByGroupAndAssignee(group, member);
            
            // Count completed and late tasks
            for (Task task : tasks) {
                if (task.getStatus() == TaskStatus.COMPLETED) {
                    completedCount++;
                    
                    // Check if task was completed late
                    if (task.getUpdatedAt() != null && 
                        task.getDeadline() != null && 
                        task.getUpdatedAt().toLocalDate().isAfter(task.getDeadline())) {
                        lateCount++;
                    }
                }
            }
        }
        
        Map<String, Integer> result = new HashMap<>();
        result.put("completed", completedCount);
        result.put("late", lateCount);
        
        return result;
    }
}