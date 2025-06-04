# UC007 - Đánh giá mức độ đóng góp (Contribution Score Evaluation)

## Đặc tả Use Case

| Thuộc tính | Chi tiết |
|------------|----------|
| **Mã Use case** | UC007 |
| **Tên Use case** | Đánh giá mức độ đóng góp |
| **Tác nhân** | Hệ thống, Người hướng dẫn |
| **Mô tả ngắn** | Hệ thống tự động tính toán điểm đóng góp của thành viên dựa trên công thức kết hợp nhiều yếu tố |
| **Tiền điều kiện** | Có dữ liệu từ UC004 (Task Management), UC005 (Peer Review), UC006 (GitHub Integration), UC008 (Late Task Detection) |
| **Hậu điều kiện** | • Điểm đóng góp được xác định và lưu trữ<br>• Người hướng dẫn có thể xem và điều chỉnh điểm |

### Luồng sự kiện chính (Thành công)

| STT | Thực hiện bởi | Hành động |
|-----|---------------|-----------|
| 1 | Hệ thống | Tính WeightedTaskCompletionScore dựa trên độ khó các task đã hoàn thành |
| 2 | Hệ thống | Tính điểm đóng góp theo công thức: `(W1 * WeightedTaskCompletionScore) + (W2 * PeerReviewScore) + (W3 * CommitCount) - (W4 * LateTaskCount)` |
| 3 | Người hướng dẫn | Xem và điều chỉnh điểm nếu cần thiết |
| 4 | Hệ thống | Lưu điểm cuối cùng và đánh dấu là final |

## Implementation Analysis

### Core Components

1. **ContributionScoreServiceImpl** - Logic tính toán điểm chính
2. **ContributionScoreController** - REST API endpoints
3. **ContributionScoreScheduler** - Tự động tính toán hàng ngày
4. **ContributionScore Entity** - Model dữ liệu điểm đóng góp

### Calculation Formula

```
ContributionScore = (W1 * WeightedTaskCompletionScore) + 
                   (W2 * PeerReviewScore) + 
                   (W3 * CommitCount) - 
                   (W4 * LateTaskCount)
```

**Thành phần tính toán:**
- **WeightedTaskCompletionScore**: Điểm hoàn thành task có trọng số theo độ khó
- **PeerReviewScore**: Điểm trung bình từ peer review
- **CommitCount**: Số commit hợp lệ (theo convention [TASK-ID])
- **LateTaskCount**: Số task nộp muộn + task quá hạn chưa hoàn thành

## Sequence Diagrams

### SD-01 — Happy Path: Tính toán điểm đóng góp tự động

```mermaid
sequenceDiagram
    participant System as System<<Scheduler>>
    participant BE as BE:ContributionScoreService<<Service>>
    participant TaskRepo as BE:TaskRepository<<Repository>>
    participant PeerRepo as BE:PeerReviewRepository<<Repository>>
    participant CommitRepo as BE:CommitRecordRepository<<Repository>>
    participant ScoreRepo as BE:ContributionScoreRepository<<Repository>>

    Note over System: Hàng ngày lúc 00:00
    System->>BE: calculateScoresForProject(project)
    BE->>BE: getAllProjectUsers(project)
    
    loop Cho từng user trong project
        BE->>TaskRepo: findByAssigneeAndGroupProjectAndStatus(user, project, COMPLETED)
        TaskRepo-->>BE: completedTasks
        BE->>BE: calculateWeightedTaskCompletionScore(completedTasks)
        
        BE->>PeerRepo: findAverageScoreByRevieweeAndProject(user, project)
        PeerRepo-->>BE: peerReviewScore
        
        BE->>CommitRepo: countValidCommitsForUserTasks(user, project)
        CommitRepo-->>BE: commitCount
        
        BE->>TaskRepo: countLateTasks(user, project)
        TaskRepo-->>BE: lateTaskCount
        
        BE->>BE: calculateFinalScore(w1*taskScore + w2*peerScore + w3*commits - w4*lateTasks)
        BE->>ScoreRepo: findByUserAndProject(user, project)
        
        alt Existing score
            ScoreRepo-->>BE: existingScore
            BE->>BE: updateExistingScore(score, newValues)
        else New score
            BE->>BE: createNewScore(user, project, calculatedValues)
        end
        
        BE->>ScoreRepo: save(contributionScore)
        ScoreRepo-->>BE: savedScore
    end
    
    BE-->>System: calculation completed
```

### SD-02 — Instructor View và Adjustment: Người hướng dẫn xem và điều chỉnh điểm

```mermaid
sequenceDiagram
    participant FE as FE:InstructorDashboard
    participant BE as BE:ContributionScoreController<<Controller>>
    participant Service as BE:ContributionScoreService<<Service>>
    participant ScoreRepo as BE:ContributionScoreRepository<<Repository>>
    participant Auth as BE:SecurityUtils<<Security>>

    FE->>BE: GET /api/contribution-scores/projects/{projectId}
    BE->>Auth: getCurrentUser()
    Auth-->>BE: currentUser
    
    alt Unauthorized (403)
        BE->>BE: checkRole(INSTRUCTOR/ADMIN)
        BE-->>FE: 403 Forbidden
    else Authorized
        BE->>Service: getScoresByProject(project)
        Service->>ScoreRepo: findByProject(project)
        ScoreRepo-->>Service: contributionScores[]
        Service-->>BE: ContributionScoreResponse[]
        BE-->>FE: 200 OK + scores
        
        Note over FE: Instructor reviews scores
        FE->>FE: displayScoresTable()
        
        opt Adjustment needed
            FE->>BE: PUT /api/contribution-scores/{id}/adjust
            Note over FE: {adjustedScore, adjustmentReason}
            BE->>Service: adjustScore(id, adjustedScore, reason)
            Service->>ScoreRepo: findById(id)
            ScoreRepo-->>Service: contributionScore
            Service->>Service: setAdjustedScore(adjustedScore)
            Service->>Service: setAdjustmentReason(reason)
            Service->>ScoreRepo: save(updatedScore)
            ScoreRepo-->>Service: savedScore
            Service-->>BE: ContributionScoreResponse
            BE-->>FE: 200 OK + updatedScore
            FE->>FE: refreshScoreDisplay()
        end
    end
```

### SD-03 — Score Finalization: Hoàn tất điểm cuối cùng

```mermaid
sequenceDiagram
    participant FE as FE:InstructorPanel
    participant BE as BE:ContributionScoreController<<Controller>>
    participant Service as BE:ContributionScoreService<<Service>>
    participant ScoreRepo as BE:ContributionScoreRepository<<Repository>>
    participant Auth as BE:SecurityUtils<<Security>>

    FE->>BE: PUT /api/contribution-scores/projects/{projectId}/finalize
    BE->>Auth: getCurrentUser()
    Auth-->>BE: currentUser
    
    alt Unauthorized (403)
        BE->>BE: checkRole(INSTRUCTOR/ADMIN)
        BE-->>FE: 403 Forbidden
    else Authorized
        BE->>Service: finalizeScores(projectId)
        Service->>ScoreRepo: findByProject(project)
        ScoreRepo-->>Service: allScores[]
        
        loop For each score
            Service->>Service: setIsFinal(true)
            Service->>ScoreRepo: save(score)
            ScoreRepo-->>Service: finalizedScore
        end
        
        Service-->>BE: finalizedScores[]
        BE-->>FE: 200 OK + finalizedScores
        FE->>FE: displayFinalizationSuccess()
        FE->>FE: disableAdjustmentButtons()
    end
```

### SD-04 — Scheduled Auto-Calculation: Tính toán tự động theo lịch

```mermaid
sequenceDiagram
    participant Scheduler as System:ContributionScoreScheduler<<Scheduler>>
    participant ScoreService as BE:ContributionScoreService<<Service>>
    participant FreeRiderService as BE:FreeRiderDetectionService<<Service>>
    participant ProjectRepo as BE:ProjectRepository<<Repository>>
    participant NotificationService as BE:NotificationService<<Service>>

    Note over Scheduler: @Scheduled(cron = "0 0 0 * * ?")
    Scheduler->>Scheduler: calculateDailyContributionScores()
    Scheduler->>ProjectRepo: findAllActiveProjects()
    ProjectRepo-->>Scheduler: activeProjects[]
    
    loop For each active project
        Scheduler->>ScoreService: calculateScoresForProject(project)
        Note over ScoreService: Executes full calculation flow
        ScoreService-->>Scheduler: scores calculated
        
        opt Free rider detection
            Scheduler->>FreeRiderService: detectFreeRiders(projectId)
            FreeRiderService-->>Scheduler: freeRiders[]
            
            alt Free riders found
                loop For each free rider
                    Scheduler->>NotificationService: sendFreeRiderAlert(user, project)
                    NotificationService-->>Scheduler: notification sent
                end
            end
        end
        
        alt Error handling
            Note over Scheduler: Exception in calculation
            Scheduler->>Scheduler: log.error("Calculation failed for project")
            Scheduler->>Scheduler: continue with next project
        end
    end
    
    Scheduler->>Scheduler: log.info("Daily calculation completed")
```

## Key Features

### 1. Automated Daily Calculation
- Chạy tự động lúc 00:00 hàng ngày
- Tính toán cho tất cả projects đang hoạt động
- Tích hợp với free rider detection

### 2. Multi-factor Scoring
- **Task Completion**: Điểm hoàn thành task có trọng số
- **Peer Reviews**: Điểm đánh giá từ đồng nghiệp
- **Commit Activity**: Hoạt động commit trên GitHub
- **Late Penalty**: Trừ điểm cho task nộp muộn

### 3. Instructor Management
- Xem tổng quan điểm đóng góp của team
- Điều chỉnh điểm với lý do cụ thể
- Hoàn tất điểm cuối cùng (finalize)

### 4. Score History & Tracking
- Lưu trữ lịch sử thay đổi điểm
- Theo dõi điều chỉnh của instructor
- Đánh dấu điểm đã được finalize

## Error Handling

### Authentication & Authorization
- Kiểm tra quyền INSTRUCTOR/ADMIN cho các thao tác điều chỉnh
- Trả về 403 Forbidden nếu không có quyền

### Data Validation
- Kiểm tra tồn tại của project và user
- Validate điểm điều chỉnh trong phạm vi hợp lệ
- Đảm bảo dữ liệu tính toán đầy đủ

### Calculation Resilience
- Xử lý exception trong quá trình tính toán
- Tiếp tục với project khác nếu có lỗi
- Logging chi tiết cho debugging

## Technology Stack

- **Backend**: Spring Boot, Spring Security, JPA/Hibernate
- **Database**: MySQL với các repositories
- **Scheduling**: Spring @Scheduled annotations
- **Frontend**: React/TypeScript với contribution score service
- **Security**: JWT-based authentication
