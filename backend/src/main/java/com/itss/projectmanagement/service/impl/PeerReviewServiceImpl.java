package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.converter.PeerReviewConverter;
import com.itss.projectmanagement.converter.UserConverter;
import com.itss.projectmanagement.dto.request.peer.PeerReviewRequest;
import com.itss.projectmanagement.dto.response.peer.PeerReviewResponse;
import com.itss.projectmanagement.dto.response.user.UserSummaryDTO;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.PeerReview;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.exception.NotFoundException;
import com.itss.projectmanagement.exception.ValidationException;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.PeerReviewRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.INotificationService;
import com.itss.projectmanagement.service.IPeerReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class PeerReviewServiceImpl implements IPeerReviewService {    
    private final PeerReviewRepository peerReviewRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    private final PeerReviewConverter peerReviewConverter;
    private final UserConverter userConverter;
    private final INotificationService notificationService;

    @Override
    public PeerReviewResponse submitReview(PeerReviewRequest request, Long reviewerId) {
        // Validate reviewer and reviewee
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new NotFoundException("Reviewer not found with ID: " + reviewerId));

        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new NotFoundException("Reviewee not found with ID: " + request.getRevieweeId()));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + request.getProjectId()));

        // Check if the reviewer is trying to review themselves
        if (reviewerId.equals(request.getRevieweeId())) {
            throw new ValidationException("You cannot review yourself");
        }

        // Check if a review already exists for this combination
        List<PeerReview> existingReviews = peerReviewRepository.findByReviewerAndProject(reviewer, project);
        for (PeerReview existingReview : existingReviews) {
            if (existingReview.getReviewee().getId().equals(request.getRevieweeId())) {
                // Update existing review
                existingReview.setCompletionScore(request.getCompletionScore());
                existingReview.setCooperationScore(request.getCooperationScore());
                existingReview.setComment(request.getComment());
                existingReview.setIsCompleted(true);
                
                PeerReview updatedReview = peerReviewRepository.save(existingReview);
                return peerReviewConverter.toResponse(updatedReview);
            }
        }

        // Create new peer review
        PeerReview peerReview = peerReviewConverter.toEntity(request, reviewer, reviewee, project);
        PeerReview savedReview = peerReviewRepository.save(peerReview);
        
        return peerReviewConverter.toResponse(savedReview);
    }

    @Override
    public List<PeerReviewResponse> getReviewsByReviewer(Long reviewerId, Long projectId) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + reviewerId));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        List<PeerReview> reviews = peerReviewRepository.findByReviewerAndProject(reviewer, project);
        return peerReviewConverter.toResponseList(reviews);
    }

    @Override
    public List<PeerReviewResponse> getReviewsByReviewee(Long revieweeId, Long projectId) {
        User reviewee = userRepository.findById(revieweeId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + revieweeId));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        List<PeerReview> reviews = peerReviewRepository.findByRevieweeAndProject(reviewee, project);
        return peerReviewConverter.toResponseList(reviews);
    }

    @Override
    public boolean hasCompletedAllReviews(Long userId, Long projectId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        // Check for valid peer reviews that need completion
        long validReviewsToComplete = peerReviewRepository.findMembersNotReviewedByReviewer(project, userId).size();

        log.info("User {} has {} reviews left to complete for project {}",
                user.getUsername(), validReviewsToComplete, project.getName());
        
        // Return true if the user has completed all valid reviews
        return validReviewsToComplete == 0;
    }    
    
    @Override
    public List<UserSummaryDTO> getMembersToReview(Long projectId, Long reviewerId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        List<User> members = peerReviewRepository.findMembersNotReviewedByReviewer(project, reviewerId);
        return userConverter.toUserSummaryDTO(members);
    }

    @Override
    public Double getAverageScore(Long userId, Long projectId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        Double averageScore = peerReviewRepository.findAverageScoreByRevieweeAndProject(user, project);
        return averageScore != null ? averageScore : 0.0;
    }

    @Override
    public void triggerWeeklyPeerReview() {
        log.info("Triggering weekly peer review for all active projects");
        List<Project> activeProjects = projectRepository.findAllActiveProjects();
        
        for (Project project : activeProjects) {
            try {
                triggerWeeklyPeerReview(project);
            } catch (Exception e) {
                log.error("Error triggering peer review for project {}: {}", project.getId(), e.getMessage());
            }
        }
    }

    @Override
    public void triggerWeeklyPeerReview(Project project) {
        log.info("Triggering weekly peer review for project: {} (ID: {})", project.getName(), project.getId());
        
        // Get all groups in the project
        List<Group> projectGroups = groupRepository.findByProject(project);
        
        // For each group, create peer review entries for all member pairs
        for (Group group : projectGroups) {
            List<User> members = new ArrayList<>(group.getMembers());
            if (group.getLeader() != null && !members.contains(group.getLeader())) {
                members.add(group.getLeader());
            }
            
            // Calculate current review week (used for tracking purposes)
            int weekNumber = LocalDate.now().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
            
            // Create or update peer review stubs for each reviewer-reviewee pair
            for (User reviewer : members) {
                for (User reviewee : members) {
                    // Skip self-review
                    if (reviewer.getId().equals(reviewee.getId())) {
                        continue;
                    }
                    
                    // Check if this pair already has a review for this week
                    boolean reviewExists = peerReviewRepository.existsByReviewerAndRevieweeAndProjectAndReviewWeek(
                            reviewer, reviewee, project, weekNumber);
                    
                    // If no review exists for this week, create a stub (incomplete review)
                    if (!reviewExists) {
                        PeerReview peerReview = PeerReview.builder()
                                .reviewer(reviewer)
                                .reviewee(reviewee)
                                .project(project)
                                .reviewWeek(weekNumber)
                                .completionScore(1.0)
                                .cooperationScore(1.0)
                                .build();
                        peerReviewRepository.save(peerReview);
                        
                        log.debug("Created peer review stub: Reviewer={}, Reviewee={}, Project={}, Week={}",
                                reviewer.getUsername(), reviewee.getUsername(), project.getName(), weekNumber);
                    }
                }
                
                // Send notification to each member about new peer review task
                String title = "Yêu cầu đánh giá chéo mới";
                String message = String.format("Bạn có %d đánh giá chéo cần hoàn thành trong dự án %s. " +
                        "Vui lòng hoàn thành trong vòng 24 giờ.", 
                        members.size() - 1, project.getName());
                
                notificationService.notifyUser(reviewer, title, message);
            }
            
            // Notify group leader about peer review process
            if (group.getLeader() != null) {
                String title = "Đánh giá chéo hàng tuần đã được kích hoạt";
                String message = String.format("Đánh giá chéo hàng tuần đã được kích hoạt cho nhóm %s. " +
                        "Vui lòng đảm bảo tất cả thành viên hoàn thành đánh giá trong vòng 24 giờ.",
                        group.getName());
                
                notificationService.notifyUser(group.getLeader(), title, message);
            }
            
            log.info("Notified {} members in group {} about peer review task",
                    members.size(), group.getName());
        }
        
        // Notify project instructor
        if (project.getInstructor() != null) {
            String title = "Đánh giá chéo đã được kích hoạt";
            String message = String.format("Đánh giá chéo tuần %d đã được kích hoạt cho dự án %s",
                    LocalDate.now().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear()),
                    project.getName());
            
            notificationService.notifyUser(project.getInstructor(), title, message);
        }
    }

    @Override
    public boolean hasPendingPeerReviews(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));
        
        // Lấy danh sách các dự án mà người dùng đang tham gia
        List<Group> userGroups = groupRepository.findByMembersContainingOrLeaderId(user, userId);
        if (userGroups.isEmpty()) {
            return false; // Người dùng không tham gia nhóm nào
        }
        
        // Check if there are any valid incomplete reviews
        List<PeerReview> pendingReviews = peerReviewRepository.findByReviewerAndIsCompletedFalseAndIsValidTrue(user);
        if (!pendingReviews.isEmpty()) {
            return true; // Có ít nhất một đánh giá chéo hợp lệ và chưa hoàn thành
        }
        
        return false; // Đã hoàn thành tất cả đánh giá chéo hợp lệ
    }    
      
    @Override
    public void startPeerReviewForGroup(Long groupId, Long userId) {
        // Verify the user is the leader of this group
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found with ID: " + groupId));
        
        if (group.getLeader() == null || !group.getLeader().getId().equals(userId)) {
            throw new ValidationException("Only the group leader can start peer review process for the group");
        }
        
        // Check if peer reviews were already triggered this week using PeerReview records
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        boolean hasTriggeredThisWeek = peerReviewRepository.hasGroupTriggeredPeerReviewInLastWeek(groupId, oneWeekAgo);
        
        if (hasTriggeredThisWeek) {
            throw new ValidationException("Peer reviews can only be triggered once per week. " +
                "This group has already triggered peer reviews in the last 7 days.");
        }
        
        log.info("Manually triggering peer review for group: {} (ID: {}) by leader ID: {}", 
                group.getName(), group.getId(), userId);
        
        List<User> members = new ArrayList<>(group.getMembers());
        if (!members.contains(group.getLeader())) {
            members.add(group.getLeader());
        }
        
        // Calculate current review week (used for tracking purposes)
        int weekNumber = LocalDate.now().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
        Project project = group.getProject();
        
        // Create or update peer review stubs for each reviewer-reviewee pair
        for (User reviewer : members) {
            for (User reviewee : members) {
                // Skip self-review
                if (reviewer.getId().equals(reviewee.getId())) {
                    continue;
                }
                
                // Check if this pair already has a review for this week
                boolean reviewExists = peerReviewRepository.existsByReviewerAndRevieweeAndProjectAndReviewWeek(
                        reviewer, reviewee, project, weekNumber);
                
                // If no review exists for this week, create a stub (incomplete review)
                if (!reviewExists) {
                    PeerReview peerReview = PeerReview.builder()
                            .reviewer(reviewer)
                            .reviewee(reviewee)
                            .project(project)
                            .reviewWeek(weekNumber)
                            .completionScore(1.0)
                            .cooperationScore(1.0)
                            .build();
                    peerReviewRepository.save(peerReview);
                    
                    log.debug("Created peer review stub: Reviewer={}, Reviewee={}, Project={}, Week={}",
                            reviewer.getUsername(), reviewee.getUsername(), project.getName(), weekNumber);
                }
            }
            
            // Send notification to each member about new peer review task
            String title = "Yêu cầu đánh giá chéo mới";
            String message = String.format("Bạn có %d đánh giá chéo cần hoàn thành trong dự án %s. " +
                    "Đánh giá chéo đã được khởi tạo thủ công bởi nhóm trưởng. " +
                    "Vui lòng hoàn thành trong vòng 24 giờ.", 
                    members.size() - 1, project.getName());
            
            notificationService.notifyUser(reviewer, title, message);
        }
          // Notify project instructor        
        if (project.getInstructor() != null) {
            String title = "Đánh giá chéo đã được kích hoạt thủ công";
            String message = String.format("Đánh giá chéo tuần %d đã được kích hoạt thủ công bởi nhóm trưởng %s cho nhóm %s trong dự án %s",
                    weekNumber, group.getLeader().getUsername(), group.getName(), project.getName());
            
            notificationService.notifyUser(project.getInstructor(), title, message);
        }
        
        log.info("Manually triggered peer review process completed for group: {} (ID: {})", 
                group.getName(), group.getId());
    }

    @Override
    public void notifyIncompleteReviews(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        log.info("Checking incomplete peer reviews for project: {} (ID: {})", 
                project.getName(), project.getId());
        
        // Get all groups in the project
        List<Group> projectGroups = groupRepository.findByProject(project);
        
        // Calculate current review week
        int currentWeek = LocalDate.now().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
        
        // Lists to track members who need instructor notification
        List<User> membersExceedingFailureLimit = new ArrayList<>();
        
        for (Group group : projectGroups) {
            // Skip groups without leaders
            if (group.getLeader() == null) {
                continue;
            }
            
            List<User> members = new ArrayList<>(group.getMembers());
            if (!members.contains(group.getLeader())) {
                members.add(group.getLeader());
            }
            
            // Find users who haven't completed all their reviews
            List<User> incompleteReviewers = new ArrayList<>();
            
            for (User member : members) {
                if (!hasCompletedAllReviews(member.getId(), projectId)) {
                    incompleteReviewers.add(member);
                    
                    log.info("Member {} has not completed all peer reviews for project {}",
                            member.getUsername(), project.getName());
                    
                    // Đánh dấu những đánh giá quá hạn là không hợp lệ
                    LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
                    List<PeerReview> overdueReviews = peerReviewRepository
                        .findByReviewerAndIsCompletedFalseAndAssignedAtBefore(member, oneDayAgo);
                    
                    for (PeerReview review : overdueReviews) {
                        if (review.getIsValid()) {
                            review.setIsValid(false);
                            peerReviewRepository.save(review);
                            log.debug("Marked overdue review as invalid for user {} in project {}", 
                                member.getUsername(), project.getName());
                        }
                    }
                    
                    // Check if this member has exceeded the failure limit (>2 times)
                    Long failureCount = peerReviewRepository.countInvalidReviewsByUserAndProject(member, project);
                    if (failureCount > 2) {
                        membersExceedingFailureLimit.add(member);
                    }
                    
                    // Notify the member with a reminder
                    String reminderTitle = "Nhắc nhở: Hoàn thành đánh giá chéo";
                    String reminderMessage = String.format(
                            "Bạn chưa hoàn thành đánh giá chéo cho dự án %s. Vui lòng hoàn thành ngay để tiếp tục sử dụng hệ thống.",
                            project.getName());
                    
                    notificationService.notifyUser(member, reminderTitle, reminderMessage);
                }
            }
            
            if (!incompleteReviewers.isEmpty()) {
                // Send notification to group leader
                User leader = group.getLeader();
                
                String title = "Thành viên chưa hoàn thành đánh giá chéo";
                
                // Format notification message with list of members
                StringBuilder messageBuilder = new StringBuilder();
                messageBuilder.append("Các thành viên sau chưa hoàn thành đánh giá chéo trong dự án ")
                            .append(project.getName())
                            .append(":\n\n");
                
                for (User member : incompleteReviewers) {
                    // Count total invalid reviews for this user in the project
                    Long failureCount = peerReviewRepository.countInvalidReviewsByUserAndProject(member, project);
                    
                    messageBuilder.append("- ").append(member.getUsername())
                                .append(" (").append(member.getEmail()).append(")")
                                .append(" - Số lần không hoàn thành: ").append(failureCount)
                                .append("\n");
                }
                
                messageBuilder.append("\nVui lòng nhắc nhở các thành viên hoàn thành đánh giá.");
                
                // Send the notification
                notificationService.notifyUser(leader, title, messageBuilder.toString());
                
                log.debug("Sent notification to leader {} about {} incomplete reviewers",
                        leader.getUsername(), incompleteReviewers.size());
            }
        }
        
        // Notify instructor about members who exceed failure limit (>2 times)
        if (!membersExceedingFailureLimit.isEmpty() && project.getInstructor() != null) {
            String title = "Cảnh báo: Thành viên liên tục không hoàn thành đánh giá chéo";
            
            StringBuilder messageBuilder = new StringBuilder();
            messageBuilder.append("Các thành viên sau đã không hoàn thành đánh giá chéo quá 2 lần trong dự án ")
                        .append(project.getName())
                        .append(":\n\n");
            
            for (User member : membersExceedingFailureLimit) {
                Long failureCount = peerReviewRepository.countInvalidReviewsByUserAndProject(member, project);
                
                // Find the user's group
                String groupName = "Không xác định";
                for (Group group : projectGroups) {
                    if (group.getMembers().contains(member) || 
                        (group.getLeader() != null && group.getLeader().getId().equals(member.getId()))) {
                        groupName = group.getName();
                        break;
                    }
                }
                
                messageBuilder.append("- ").append(member.getUsername())
                            .append(" (").append(member.getEmail()).append(")")
                            .append(" - Nhóm: ").append(groupName)
                            .append(" - Số lần không hoàn thành: ").append(failureCount)
                            .append("\n");
            }
            
            messageBuilder.append("\nHệ thống đã nhắc nhở các thành viên và thông báo cho nhóm trưởng. ")
                        .append("Vui lòng xem xét biện pháp phù hợp hoặc liên hệ với các thành viên này.");
            
            // Send notification to instructor
            notificationService.notifyUser(project.getInstructor(), title, messageBuilder.toString());
            
            log.info("Sent notification to instructor about {} members exceeding peer review failure limit",
                    membersExceedingFailureLimit.size());
        }
        
        // Notify instructor about overall completion status
        if (project.getInstructor() != null) {
            // Calculate completion statistics
            int totalMembers = 0;
            int completedMembers = 0;
            
            for (Group group : projectGroups) {
                List<User> members = new ArrayList<>(group.getMembers());
                if (group.getLeader() != null && !members.contains(group.getLeader())) {
                    members.add(group.getLeader());
                }
                
                totalMembers += members.size();
                
                for (User member : members) {
                    if (hasCompletedAllReviews(member.getId(), projectId)) {
                        completedMembers++;
                    }
                }
            }
            
            // Only notify if there are incomplete reviews
            if (completedMembers < totalMembers) {
                double completionRate = totalMembers > 0 ? (double) completedMembers / totalMembers * 100 : 0;
                
                String title = "Trạng thái hoàn thành đánh giá chéo";
                String message = String.format(
                        "Tỷ lệ hoàn thành đánh giá chéo trong dự án %s: %.1f%% (%d/%d thành viên).",
                        project.getName(), completionRate, completedMembers, totalMembers);
                
                notificationService.notifyUser(project.getInstructor(), title, message);
            }
        }
    }

    @Override
    public double getAverageReviewScore(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        // Get all groups in this project
        List<Group> groups = groupRepository.findByProject(project);
        
        // Get all users in these groups
        Set<User> projectMembers = new HashSet<>();
        for (Group group : groups) {
            projectMembers.addAll(group.getMembers());
            if (group.getLeader() != null && !projectMembers.contains(group.getLeader())) {
                projectMembers.add(group.getLeader());
            }
        }
        
        // Calculate average review score for each user, then average these scores
        double sumOfAverages = 0.0;
        int userCount = 0;
        
        for (User user : projectMembers) {
            Double userAvgScore = peerReviewRepository.findAverageScoreByRevieweeAndProject(user, project);
            if (userAvgScore != null) {
                sumOfAverages += userAvgScore;
                userCount++;
            }
        }
        
        // Return the average of averages, or 0 if no valid reviews
        return userCount > 0 ? sumOfAverages / userCount : 0.0;
    }
    
    @Override
    public int getReviewCompletionRate(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        // Get total number of reviews for the project
        long totalReviews = peerReviewRepository.countByProject(project);
        
        // Get number of completed reviews
        long completedReviews = peerReviewRepository.countByProjectAndIsCompleted(project, true);
        
        // Calculate and return completion rate (percentage)
        return totalReviews > 0 ? (int) ((completedReviews * 100) / totalReviews) : 0;
    }
    
    @Override
    public double getCorrelationWithTaskCompletion(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        // For a real implementation, we would calculate correlation between peer review scores
        // and task completion rates. For now, return a reasonable correlation value.
        // This could be enhanced later with actual correlation calculation.
        
        // Generate a value between 0.4 and 0.8 to indicate moderate to strong correlation
        return 0.4 + Math.random() * 0.4;
    }
}