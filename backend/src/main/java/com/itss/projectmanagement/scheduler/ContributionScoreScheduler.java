package com.itss.projectmanagement.scheduler;

import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.service.IContributionScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class ContributionScoreScheduler {

    private final IContributionScoreService contributionScoreService;
    private final ProjectRepository projectRepository;

    /**
     * Runs every day at midnight to recalculate contribution scores for all active projects.
     */
    @Scheduled(cron = "0 * * * * ?", zone = "Asia/Ho_Chi_Minh")
    public void calculateDailyContributionScores() {
        log.info("Scheduled task: Starting daily contribution score calculation");
        List<Project> activeProjects = projectRepository.findAllActiveProjects();
        for (Project project : activeProjects) {
            contributionScoreService.calculateScoresForProject(project);
            log.info("Scheduled task: Contribution scores updated for project {}", project.getName());
        }
    }
}