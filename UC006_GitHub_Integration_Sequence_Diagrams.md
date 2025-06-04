# UC006: GitHub Integration and Task History Tracking - Sequence Diagrams

Based on the actual implementation analysis, here are the sequence diagrams for the GitHub integration feature that automatically fetches commits and tracks task progress.

## Scenario 1: Scheduled Commit Fetching (Happy Path)

```mermaid
sequenceDiagram
    participant Scheduler as GitHubCommitScheduler
    participant GitHubService as GitHubServiceImpl
    participant GroupRepo as GroupRepository
    participant GitHub as GitHub API
    participant CommitRepo as CommitRecordRepository
    participant TaskRepo as TaskRepository
    participant NotificationService as INotificationService

    Note over Scheduler: Runs every hour (3600000ms)
    Scheduler->>+Scheduler: fetchCommits()
    Scheduler->>Scheduler: log.info("Starting scheduled GitHub commit fetch")
    
    Scheduler->>+GroupRepo: findAll()
    GroupRepo-->>-Scheduler: List<Group> groups
    
    loop For each group with repositoryUrl
        Scheduler->>Scheduler: log.debug("Fetching commits for group...")
        Scheduler->>+GitHubService: fetchAndProcessCommits(group)
        
        GitHubService->>GitHubService: extractRepoFullName(repositoryUrl)
        GitHubService->>+GitHub: getRepository(repoName)
        GitHub-->>-GitHubService: GHRepository repository
        
        GitHubService->>+GitHub: repository.listCommits()
        GitHub-->>-GitHubService: PagedIterable<GHCommit> commits
        
        loop For each commit
            GitHubService->>+CommitRepo: findByCommitId(commit.SHA1)
            CommitRepo-->>-GitHubService: Optional<CommitRecord> existing
            
            alt Commit not already processed
                GitHubService->>+GitHubService: processCommit(commit, group)
                GitHubService->>GitHubService: extractTaskId(commit.message)
                
                alt TaskId found in commit message
                    GitHubService->>+TaskRepo: findById(taskId)
                    TaskRepo-->>-GitHubService: Optional<Task> task
                    
                    GitHubService->>GitHubService: Create CommitRecord with task link
                    GitHubService->>+CommitRepo: save(commitRecord)
                    CommitRepo-->>-GitHubService: CommitRecord saved
                else No TaskId or invalid TaskId
                    GitHubService->>GitHubService: Create CommitRecord (isValid=false)
                    GitHubService->>+CommitRepo: save(commitRecord)
                    CommitRepo-->>-GitHubService: CommitRecord saved
                end
                GitHubService-->>-GitHubService: processCommit completed
            end
        end
        
        GitHubService-->>-Scheduler: int newCommitCount
    end
    
    Scheduler->>Scheduler: log.info("Completed scheduled GitHub commit fetch")
    Scheduler-->>-Scheduler: fetchCommits completed
```

## Scenario 2: Commit Processing with Task Validation

```mermaid
sequenceDiagram
    participant GitHubService as GitHubServiceImpl
    participant CommitRepo as CommitRecordRepository
    participant TaskRepo as TaskRepository
    participant NotificationService as INotificationService
    participant GroupLeader as Group Leader

    GitHubService->>+GitHubService: processCommit(ghCommit, group)
    GitHubService->>GitHubService: commit.getCommitShortInfo()
    GitHubService->>GitHubService: extractTaskId(message)
    
    Note over GitHubService: Uses regex pattern \\[TASK-(\\d+)\\]
    
    alt TaskId extracted successfully
        GitHubService->>+TaskRepo: findById(Long.valueOf(taskId))
        TaskRepo-->>-GitHubService: Optional<Task> task
        
        alt Task exists
            GitHubService->>GitHubService: Create CommitRecord (isValid=true, task linked)
            GitHubService->>+CommitRepo: save(commitRecord)
            CommitRepo-->>-GitHubService: CommitRecord saved
        else Task doesn't exist
            GitHubService->>GitHubService: Create CommitRecord (isValid=false)
            GitHubService->>+CommitRepo: save(commitRecord)
            CommitRepo-->>-GitHubService: CommitRecord saved
            
            GitHubService->>+GitHubService: notifyLeaderAboutInvalidCommit(group, commitRecord)
            GitHubService->>+NotificationService: notifyUser(groupLeader, title, message)
            NotificationService->>GroupLeader: Invalid commit notification
            NotificationService-->>-GitHubService: Notification sent
            GitHubService-->>-GitHubService: Notification completed
        end
    else No TaskId found
        GitHubService->>GitHubService: Create CommitRecord (isValid=false, no task)
        GitHubService->>+CommitRepo: save(commitRecord)
        CommitRepo-->>-GitHubService: CommitRecord saved
    end
    
    GitHubService-->>-GitHubService: processCommit completed
```

## Scenario 3: REST API Commit Retrieval

```mermaid
sequenceDiagram
    participant Frontend as Frontend Client
    participant GitHubController as GitHubController
    participant GitHubService as GitHubServiceImpl
    participant CommitRepo as CommitRecordRepository
    participant GroupRepo as GroupRepository
    participant TaskRepo as TaskRepository
    participant UserRepo as UserRepository

    Note over Frontend: User requests commit data
    
    Frontend->>+GitHubController: GET /api/github/commits/group/{groupId}
    GitHubController->>GitHubController: @PreAuthorize check
    
    GitHubController->>+GitHubService: getCommitsByGroup(groupId)
    GitHubService->>+GroupRepo: findById(groupId)
    GroupRepo-->>-GitHubService: Group group
    
    GitHubService->>+CommitRepo: findByGroup(group)
    CommitRepo-->>-GitHubService: List<CommitRecord> commitRecords
    
    GitHubService->>+GitHubService: convertToDto(commitRecords)
    
    loop For each CommitRecord
        GitHubService->>+UserRepo: findByEmail(commitRecord.authorEmail)
        UserRepo-->>-GitHubService: Optional<User> user
        
        alt User found
            GitHubService->>GitHubService: Set userId and username in DTO
        end
        
        alt CommitRecord has task
            GitHubService->>GitHubService: Set task info in DTO
        end
        
        alt CommitRecord has group
            GitHubService->>GitHubService: Set group and project info in DTO
        end
    end
    
    GitHubService-->>-GitHubService: List<CommitRecordDTO> converted
    GitHubService-->>-GitHubController: List<CommitRecordDTO> commits
    
    GitHubController->>GitHubController: Create ApiResponse.success()
    GitHubController-->>-Frontend: ResponseEntity<ApiResponse<List<CommitRecordDTO>>>
```

## Scenario 4: Error Handling in Commit Fetching

```mermaid
sequenceDiagram
    participant Scheduler as GitHubCommitScheduler
    participant GitHubService as GitHubServiceImpl
    participant GitHub as GitHub API
    participant Logger as Logging System

    Scheduler->>+GitHubService: fetchAndProcessCommits(group)
    
    alt Repository URL is null or empty
        GitHubService->>+Logger: log.warn("Group has no GitHub repository URL")
        Logger-->>-GitHubService: Warning logged
        GitHubService-->>-Scheduler: return 0
    else Invalid repository URL format
        GitHubService->>GitHubService: extractRepoFullName(repositoryUrl)
        GitHubService->>+Logger: log.error("Invalid GitHub repository URL")
        Logger-->>-GitHubService: Error logged
        GitHubService-->>-Scheduler: return 0
    else GitHub API access error
        GitHubService->>+GitHub: getRepository(repoName)
        GitHub-->>-GitHubService: IOException thrown
        
        GitHubService->>+Logger: log.error("Error accessing GitHub repository")
        Logger-->>-GitHubService: Error logged
        GitHubService-->>-Scheduler: return 0
    end
    
    Note over Scheduler: Scheduler continues with next group despite errors
```

## Key Implementation Details

### TASK-ID Pattern
- **Regex Pattern**: `\\[TASK-(\\d+)\\]`
- **Example**: `[TASK-123]` extracts task ID `123`
- **Location**: Used in `GitHubServiceImpl.extractTaskId()` method

### Scheduling Configuration
- **Frequency**: Every hour (3600000ms by default)
- **Configuration**: `@Scheduled(fixedDelayString = "${github.commit.fetch-interval:3600000}")`
- **Runs on**: All groups with configured repository URLs

### Database Entities
- **CommitRecord**: Stores commit information with task linkage
- **Task**: Links commits to specific tasks
- **Group**: Contains repository URL configuration
- **Project**: Groups commits by project for reporting

### Validation Rules
1. Commit must contain valid `[TASK-ID]` format
2. Task ID must exist in database
3. Task must belong to the same project as the group
4. Duplicate commits (same SHA1) are skipped

### Notification System
- Group leaders are notified when invalid commits are detected
- Notifications include commit details and invalid task ID
- Only sent for commits with task ID format but non-existent task

This implementation provides automated tracking of development progress through GitHub commits while maintaining data integrity and providing proper error handling and notifications.
