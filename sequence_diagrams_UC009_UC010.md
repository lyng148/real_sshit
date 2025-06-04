# Sequence Diagrams for UC009 & UC010

## UC009 - Theo dõi biểu đồ hiệu suất làm việc (Performance Chart Monitoring)

### Scenario 1: View Commit Count Chart (Happy Path)

```mermaid
sequenceDiagram
    participant U as User
    participant PC as ProjectController<<Controller>>
    participant CS as ChartService<<Service>>
    participant PR as ProjectRepository
    participant GR as GroupRepository
    participant CR as CommitRecordRepository

    U->>PC: GET /api/projects/{id}/charts/commit-counts?rangeType=week
    PC->>PC: validatePermissions()
    alt User is Student and not Group Leader
        PC-->>U: 403 Forbidden
    else User is Instructor or Group Leader
        PC->>CS: getCommitCountChart(projectId, rangeType)
        CS->>PR: findById(projectId)
        PR-->>CS: Project
        CS->>GR: findByProject(project)
        GR-->>CS: List<Group>
        CS->>CS: calculateStartDate(rangeType)
        loop For each group
            CS->>CR: findByGroupAndIsValidAndTimestampAfter(group, true, startDate)
            CR-->>CS: List<CommitRecord>
        end
        CS->>CS: aggregateCommitsByAssignee()
        CS-->>PC: CommitCountChartDTO
        PC-->>U: 200 OK + Chart Data
    end
```

### Scenario 2: View Progress Timeline Chart (Happy Path)

```mermaid
sequenceDiagram
    participant U as User
    participant PC as ProjectController<<Controller>>
    participant CS as ChartService<<Service>>
    participant PR as ProjectRepository
    participant GR as GroupRepository
    participant TR as TaskRepository

    U->>PC: GET /api/projects/{id}/charts/progress-timeline?rangeType=month
    PC->>PC: validatePermissions()
    PC->>CS: getProgressTimelineChart(projectId, rangeType)
    CS->>PR: findById(projectId)
    PR-->>CS: Project
    CS->>GR: findByProject(project)
    GR-->>CS: List<Group>
    CS->>CS: calculateStartDate(rangeType)
    CS->>CS: generateDateList(startDate, endDate)
    loop For each group
        CS->>TR: findByGroup(group)
        TR-->>CS: List<Task>
    end
    loop For each date
        CS->>CS: calculateProgressPercentForDate(tasks, date)
    end
    CS-->>PC: ProgressTimelineChartDTO
    PC-->>U: 200 OK + Timeline Data
```

### Scenario 3: View Contribution Pie Chart (Happy Path)

```mermaid
sequenceDiagram
    participant U as User
    participant PC as ProjectController<<Controller>>
    participant CS as ChartService<<Service>>
    participant PR as ProjectRepository
    participant CSR as ContributionScoreRepository

    U->>PC: GET /api/projects/{id}/charts/contribution?rangeType=all
    PC->>PC: validatePermissions()
    PC->>CS: getContributionPieChart(projectId, rangeType)
    CS->>PR: findById(projectId)
    PR-->>CS: Project
    CS->>CSR: findByProject(project)
    CSR-->>CS: List<ContributionScore>
    CS->>CS: calculateTotalScore()
    loop For each contribution score
        CS->>CS: calculateContributionPercentage()
    end
    CS-->>PC: ContributionPieChartDTO
    PC-->>U: 200 OK + Pie Chart Data
```

### Scenario 4: Permission Denied (Exception Flow)

```mermaid
sequenceDiagram
    participant S as Student
    participant PC as ProjectController<<Controller>>
    participant PS as ProjectService<<Service>>

    S->>PC: GET /api/projects/{id}/charts/commit-counts
    PC->>PC: validatePermissions()
    PC->>PS: isUserGroupLeaderInProject(projectId)
    PS-->>PC: false
    alt User is Student and not Group Leader
        PC-->>S: 403 Forbidden - "Only group leaders or instructors can access this chart data"
    end
```

### Scenario 5: Project Not Found (Exception Flow)

```mermaid
sequenceDiagram
    participant U as User
    participant PC as ProjectController<<Controller>>
    participant CS as ChartService<<Service>>
    participant PR as ProjectRepository

    U->>PC: GET /api/projects/999/charts/commit-counts
    PC->>CS: getCommitCountChart(999, rangeType)
    CS->>PR: findById(999)
    PR-->>CS: Optional.empty()
    CS-->>PC: ResourceNotFoundException
    PC-->>U: 404 Not Found - "Project not found with id: 999"
```

---

## UC010 - Phát hiện thành viên "tự do" (Free-rider Detection)

### Scenario 1: Manual Free-rider Detection without Notifications (Happy Path)

```mermaid
sequenceDiagram
    participant I as Instructor
    participant FRC as FreeRiderDetectionController<<Controller>>
    participant FRS as FreeRiderDetectionService<<Service>>
    participant PR as ProjectRepository
    participant GR as GroupRepository
    participant CS as ContributionScoreService<<Service>>
    participant UC as UserConverter

    I->>FRC: GET /api/free-rider-detection/detect?projectId=1
    FRC->>FRS: detectFreeRidersWithoutNotification(projectId)
    FRS->>PR: findById(projectId)
    PR-->>FRS: Project
    FRS->>FRS: getFreeriderThreshold()
    FRS->>GR: findByProject(project)
    GR-->>FRS: List<Group>
    loop For each group
        FRS->>FRS: buildMemberScores(group, project)
        FRS->>CS: getScoreByUserAndProject(user, project)
        CS-->>FRS: ContributionScoreResponse
        FRS->>FRS: findGroupFreeRiders(project, group, threshold)
    end
    FRS->>UC: toDTO(freeRiderEntities)
    UC-->>FRS: List<UserDTO>
    FRS-->>FRC: List<UserDTO>
    FRC-->>I: 200 OK + Free Rider List
```

### Scenario 2: Automated Detection with Notifications (Batch Process)

```mermaid
sequenceDiagram
    participant S as Scheduler
    participant CSS as ContributionScoreScheduler
    participant CSServ as ContributionScoreService<<Service>>
    participant FRS as FreeRiderDetectionService<<Service>>
    participant NS as NotificationService<<Service>>
    participant PR as ProjectRepository

    Note over S: Daily at midnight
    S->>CSS: calculateDailyContributionScores()
    CSS->>PR: findAllActiveProjects()
    PR-->>CSS: List<Project>
    loop For each active project
        CSS->>CSServ: calculateScoresForProject(project)
        CSServ-->>CSS: void
        CSS->>FRS: detectFreeRiders(projectId)
        FRS->>FRS: findGroupFreeRiders()
        alt Free riders detected
            FRS->>NS: notifyInstructorAboutFreeRider(instructor, project, freeRider, evidence)
            NS-->>FRS: void
            FRS->>NS: notifyProjectLeaders(project, title, message)
            NS-->>FRS: void
        end
        FRS-->>CSS: List<UserDTO>
    end
```

### Scenario 3: View Free-rider Evidence (Happy Path)

```mermaid
sequenceDiagram
    participant I as Instructor
    participant FRC as FreeRiderDetectionController<<Controller>>
    participant FRS as FreeRiderDetectionService<<Service>>
    participant TR as TaskRepository
    participant CR as CommitRecordRepository
    participant PRR as PeerReviewRepository

    I->>FRC: GET /api/free-rider-detection/evidence?projectId=1&userId=5
    FRC->>FRS: getFreeRiderEvidence(userId, projectId)
    FRS->>FRS: collectFreeRiderEvidence(user, project)
    FRS->>FRS: collectTaskEvidence(user, project)
    FRS->>TR: findByGroupAndAssignee(group, user)
    TR-->>FRS: List<Task>
    FRS->>TR: findByAssigneeAndGroupProjectAndStatus(user, project, COMPLETED)
    TR-->>FRS: List<Task>
    FRS->>FRS: collectCommitEvidence(user, project)
    FRS->>CR: countByProjectIdAndAuthorEmailAndIsValidTrue(projectId, email)
    CR-->>FRS: Long
    FRS->>FRS: collectPeerReviewEvidence(user, project)
    FRS->>PRR: findAverageScoreByRevieweeAndProject(user, project)
    PRR-->>FRS: Double
    FRS-->>FRC: Map<String, Object>
    FRC-->>I: 200 OK + Evidence Data
```

### Scenario 4: Create Free-rider Case (Happy Path)

```mermaid
sequenceDiagram
    participant I as Instructor
    participant FRC as FreeRiderDetectionController<<Controller>>
    participant FRS as FreeRiderDetectionService<<Service>>
    participant UR as UserRepository
    parameter PR as ProjectRepository
    participant GR as GroupRepository
    participant FCR as FreeRiderCaseRepository
    participant OM as ObjectMapper
    participant FCC as FreeRiderCaseConverter

    I->>FRC: POST /api/free-rider-detection/create-case?projectId=1&userId=5
    FRC->>FRS: createFreeRiderCase(userId, projectId)
    FRS->>UR: findById(userId)
    UR-->>FRS: User
    FRS->>PR: findById(projectId)
    PR-->>FRS: Project
    FRS->>FCR: existsActiveCase(projectId, userId)
    FCR-->>FRS: false
    FRS->>GR: findByProjectAndMembersContains(project, student)
    GR-->>FRS: Group
    FRS->>FRS: getFreeRiderEvidence(userId, projectId)
    FRS->>OM: writeValueAsString(evidence)
    OM-->>FRS: String
    FRS->>FCR: save(freeRiderCase)
    FCR-->>FRS: FreeRiderCase
    FRS->>FCC: toDTO(savedCase)
    FCC-->>FRS: FreeRiderCaseDTO
    FRS-->>FRC: FreeRiderCaseDTO
    FRC-->>I: 200 OK + Case Created
```

### Scenario 5: Resolve Free-rider Case (Happy Path)

```mermaid
sequenceDiagram
    participant I as Instructor
    participant FRC as FreeRiderDetectionController<<Controller>>
    participant FRS as FreeRiderDetectionService<<Service>>
    participant FCR as FreeRiderCaseRepository
    participant FCC as FreeRiderCaseConverter

    I->>FRC: POST /api/free-rider-detection/resolve/123?resolution=WARNING&notes=First warning
    FRC->>FRS: resolveFreeRiderCase(caseId, resolution, notes)
    FRS->>FCR: findById(caseId)
    FCR-->>FRS: FreeRiderCase
    FRS->>FRS: setStatus(RESOLVED)
    FRS->>FRS: setResolution(WARNING)
    FRS->>FRS: setNotes(notes)
    FRS->>FRS: setResolvedAt(now)
    FRS->>FCR: save(freeRiderCase)
    FCR-->>FRS: FreeRiderCase
    FRS->>FCC: toDTO(updatedCase)
    FCC-->>FRS: FreeRiderCaseDTO
    FRS-->>FRC: FreeRiderCaseDTO
    FRC-->>I: 200 OK + Case Resolved
```

### Scenario 6: Get Risk Scores (Happy Path)

```mermaid
sequenceDiagram
    participant I as Instructor
    participant FRC as FreeRiderDetectionController<<Controller>>
    participant FRS as FreeRiderDetectionService<<Service>>
    participant PR as ProjectRepository
    participant GR as GroupRepository

    I->>FRC: GET /api/free-rider-detection/risk-scores?projectId=1
    FRC->>FRS: getFreeRiderRiskScores(projectId)
    FRS->>PR: findById(projectId)
    PR-->>FRS: Project
    FRS->>GR: findByProject(project)
    GR-->>FRS: List<Group>
    loop For each group
        FRS->>FRS: buildMemberScores(group, project)
        FRS->>FRS: average(scores.values())
        loop For each member
            FRS->>FRS: calcRiskScore(memberScore, average)
        end
    end
    FRS-->>FRC: Map<Long, Double>
    FRC-->>I: 200 OK + Risk Scores
```

### Scenario 7: No Free-riders Detected (Alternative Flow)

```mermaid
sequenceDiagram
    participant I as Instructor
    participant FRC as FreeRiderDetectionController<<Controller>>
    participant FRS as FreeRiderDetectionService<<Service>>

    I->>FRC: GET /api/free-rider-detection/detect?projectId=1
    FRC->>FRS: detectFreeRidersWithoutNotification(projectId)
    FRS->>FRS: findGroupFreeRiders(project, group, threshold)
    Note over FRS: All members have scores above threshold
    FRS-->>FRC: Empty List<UserDTO>
    FRC-->>I: 200 OK + Empty List
```

### Scenario 8: Case Already Exists (Exception Flow)

```mermaid
sequenceDiagram
    participant I as Instructor
    participant FRC as FreeRiderDetectionController<<Controller>>
    participant FRS as FreeRiderDetectionService<<Service>>
    participant FCR as FreeRiderCaseRepository

    I->>FRC: POST /api/free-rider-detection/create-case?projectId=1&userId=5
    FRC->>FRS: createFreeRiderCase(userId, projectId)
    FRS->>FCR: existsActiveCase(projectId, userId)
    FCR-->>FRS: true
    FRS-->>FRC: IllegalStateException
    FRC-->>I: 400 Bad Request - "An active case already exists for this user in this project"
```

---

## Summary

**UC009 (Performance Chart Monitoring):**
- 5 scenarios covering happy paths and exception flows
- Each scenario ≤25 messages
- Proper separation of concerns with Controller and Service stereotypes
- Error handling with alt/else blocks

**UC010 (Free-rider Detection):**
- 8 scenarios covering manual detection, automated batch processing, case management
- Separate flows for notifications vs non-notifications
- Comprehensive error handling
- Batch/scheduler processes properly separated

All sequence diagrams follow the specified rules:
- ≤25 messages per scenario
- Happy path separated from alternate/exception flows
- Batch/scheduler processes separated
- Proper Mermaid syntax with stereotypes
- Error handling with alt/else blocks
