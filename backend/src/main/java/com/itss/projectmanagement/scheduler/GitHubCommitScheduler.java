package com.itss.projectmanagement.scheduler;

import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.service.IGitHubService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GitHubCommitScheduler {

    private final IGitHubService gitHubService;
    private final GroupRepository groupRepository;

    /**
     * Periodically fetches commits from GitHub for all groups
     * Default interval is 1 hour (3600000 ms)
     */
    @Scheduled(fixedDelayString = "${github.commit.fetch-interval:3600000}")
    public void fetchCommits() {
        log.info("Starting scheduled GitHub commit fetch");
        
        List<Group> groups = groupRepository.findAll();
        int totalProcessedCommits = 0;
        
        for (Group group : groups) {
            if (group.getRepositoryUrl() != null && !group.getRepositoryUrl().isEmpty()) {
                log.debug("Fetching commits for group: {} ({})", group.getName(), group.getId());
                try {
                    int processedCommits = gitHubService.fetchAndProcessCommits(group);
                    totalProcessedCommits += processedCommits;
                } catch (Exception e) {
                    log.error("Error fetching commits for group {}: {}", group.getId(), e.getMessage());
                }
            }
        }
        
        log.info("Completed scheduled GitHub commit fetch. Processed {} new commits across {} groups", 
                totalProcessedCommits, groups.size());
    }
}