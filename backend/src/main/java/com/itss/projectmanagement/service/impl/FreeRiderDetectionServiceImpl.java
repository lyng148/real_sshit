package com.itss.projectmanagement.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itss.projectmanagement.converter.FreeRiderCaseConverter;
import com.itss.projectmanagement.converter.UserConverter;
import com.itss.projectmanagement.dto.response.freerider.FreeRiderCaseDTO;
import com.itss.projectmanagement.dto.response.user.UserDTO;
import com.itss.projectmanagement.entity.*;
import com.itss.projectmanagement.enums.TaskStatus;
import com.itss.projectmanagement.exception.NotFoundException;
import com.itss.projectmanagement.repository.*;
import com.itss.projectmanagement.service.IFreeRiderDetectionService;
import com.itss.projectmanagement.service.IGroupService;
import com.itss.projectmanagement.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FreeRiderDetectionServiceImpl implements IFreeRiderDetectionService {      
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ContributionScoreServiceImpl contributionScoreService;
    private final GroupRepository groupRepository;
    private final IGroupService groupService;
    private final INotificationService notificationService;
    private final TaskRepository taskRepository;
    private final CommitRecordRepository commitRecordRepository;
    private final PeerReviewRepository peerReviewRepository;
    private final FreeRiderCaseRepository freeRiderCaseRepository;
    private final ObjectMapper objectMapper;
    private final FreeRiderCaseConverter freeRiderCaseConverter;
    private final UserConverter userConverter;

    private static final double DEFAULT_RISK_VALUE = 0.5;
    private static final int WEEKS_TO_ANALYSE = 8;    @Override
    public List<UserDTO> detectFreeRidersWithoutNotification(Long projectId) {
        Project project = findProject(projectId);
        double threshold = project.getFreeriderThreshold();        // Chuyển đổi trực tiếp sang DTO
        List<User> freeRiders = groupRepository.findByProject(project).stream()
                .flatMap(g -> findGroupFreeRiders(project, g, threshold).stream())
                .distinct()
                .toList();
        
        return userConverter.toDTO(freeRiders);
    }    
      
    @Override
    public List<UserDTO> detectFreeRiders(Long projectId) {
        Project project          = findProject(projectId);
        double threshold         = project.getFreeriderThreshold();

        // Thu thập danh sách entity users để thông báo
        List<User> freeRiderEntities = groupRepository.findByProject(project).stream()
                .flatMap(g -> findGroupFreeRiders(project, g, threshold).stream())
                .distinct()
                .toList();

        if (!freeRiderEntities.isEmpty()) {
            notifyFreeRiders(project, freeRiderEntities, threshold);
        }
          // Chuyển đổi và trả về DTOs
        return userConverter.toDTO(freeRiderEntities);
    }

    @Override
    public Map<Long, Double> getFreeRiderRiskScores(Long projectId) {
        Project project = findProject(projectId);
        Map<Long, Double> result = new HashMap<>();

        groupRepository.findByProject(project).forEach(group -> {
            Map<User, Double> scores   = buildMemberScores(group, project);
            double avg                 = average(scores.values());
            scores.forEach((u, sc) -> result.put(u.getId(), calcRiskScore(sc, avg)));
        });
        return result;
    }

    @Override
    public Double calculateFreeRiderRiskScore(Long userId, Long projectId) {
        User user       = findUser(userId);
        Project project = findProject(projectId);
        Group group     = findUserGroup(project, user)
                .orElseThrow(() -> new NotFoundException("User is not a member of any group in this project"));

        Map<User, Double> scores = buildMemberScores(group, project);
        double avg               = average(scores.values());
        return calcRiskScore(scores.getOrDefault(user, 0d), avg);
    }

    @Override
    public String generateFreeRiderReport(Long projectId) {
        Project project = findProject(projectId);
        StringBuilder sb = new StringBuilder()
                .append("BÁO CÁO PHÁT HIỆN THÀNH VIÊN \"TỰ DO\" CHO DỰ ÁN: ")
                .append(project.getName()).append("\n\n")
                .append("Cấu hình phát hiện:\n")
                .append("- Ngưỡng phát hiện: ")
                .append(String.format("%.0f%%", project.getFreeriderThreshold() * 100))
                .append(" của điểm trung bình nhóm\n\n");

        groupRepository.findByProject(project).forEach(group -> appendGroupSection(sb, group, project));

        sb.append("Báo cáo được tạo tự động bởi hệ thống phát hiện thành viên \"tự do\".\n")
                .append("Ngày tạo: ").append(new Date()).append("\n");
        return sb.toString();
    }

    @Override
    public Map<String, Object> getFreeRiderEvidence(Long userId, Long projectId) {
        User user       = findUser(userId);
        Project project = findProject(projectId);
        return collectFreeRiderEvidence(user, project);
    }

    @Override
    public Map<String, Object> getGroupFreeRiderEvidence(Long projectId, Long groupId) {
        Project project = findProject(projectId);
        Group   group   = groupId == null ? null : groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found with ID: " + groupId));

        if (group != null && !group.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Group does not belong to the specified project");
        }

        List<Group> groups = group == null ? groupRepository.findByProject(project) : List.of(group);
        return buildGroupEvidence(project, groups);
    }



    private List<User> findGroupFreeRiders(Project project, Group group, double threshold) {
        Map<User, Double> scores = buildMemberScores(group, project);
        double avg               = average(scores.values());

        if (avg == 0) return Collections.emptyList();

        return scores.entrySet().stream()
                .filter(e -> e.getValue() < threshold * avg)
                .peek(e -> log.info("Detected free rider: {} in group {} - Score: {} (Group avg: {})",
                        e.getKey().getUsername(), group.getName(), e.getValue(), avg))
                .map(Map.Entry::getKey)
                .toList();
    }

    private void notifyFreeRiders(Project project, List<User> freeRiders, double threshold) {
        StringBuilder msg = new StringBuilder()
                .append("Hệ thống đã phát hiện ").append(freeRiders.size())
                .append(" thành viên có nguy cơ là thành viên \"tự do\" (free‑rider) trong dự án ")
                .append(project.getName()).append(":\n\n");

            freeRiders.forEach(u -> {
                Map<String, Object> evidence = collectFreeRiderEvidence(u, project);
            if (project.getInstructor() != null) {
                notificationService.notifyInstructorAboutFreeRider(project.getInstructor(), project, u, evidence);
            }
            double score = evidence.get("calculatedScore") instanceof Number ?
                    ((Number) evidence.get("calculatedScore")).doubleValue() : 0.0;
            msg.append("- ").append(u.getUsername()).append(" (").append(u.getEmail()).append(")\n")
                    .append("  Điểm đóng góp: ").append(String.format("%.2f", score))
                    .append(" (dưới ").append(String.format("%.0f", threshold * 100)).append("% điểm trung bình nhóm)\n");
        });

        msg.append("\nVui lòng xem báo cáo chi tiết trong hệ thống.");
        notificationService.notifyProjectLeaders(project, "Cảnh báo thành viên \"tự do\" trong nhóm của bạn", msg.toString());
    }

    // =============================== HELPER: DATA BUILDERS ===============================
    private Map<User, Double> buildMemberScores(Group group, Project project) {
        return getGroupMembers(group).stream()
                .distinct()
                .collect(Collectors.toMap(
                    u -> u,
                    u -> getContributionScore(u, project)
                ));
    }

    private Set<User> getGroupMembers(Group group) {
        return groupService.getGroupMembers(group.getId()).stream()
                .filter(User::isEnabled)
                .collect(Collectors.toSet());
    }

    private double getContributionScore(User user, Project project) {
        return contributionScoreService.getScoreByUserAndProject(user, project).getCalculatedScore();
    }

    private double average(Collection<Double> values) {
        return values.isEmpty() ? 0d : values.stream().mapToDouble(Double::doubleValue).average().orElse(0d);
    }

    private double calcRiskScore(double personal, double average) {
        return average <= 0 ? DEFAULT_RISK_VALUE : Math.min(1d, Math.max(0d, 1d - (personal / average)));
    }

    // =============================== HELPER: FINDERS ===============================

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + id));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + id));
    }

    private Optional<Group> findUserGroup(Project project, User user) {
        return groupRepository.findByProject(project).stream()
                .filter(g -> g.getMembers().contains(user) || (g.getLeader() != null && g.getLeader().equals(user)))
                .findFirst();
    }

    // =============================== HELPER: REPORT SECTION ===============================

    private void appendGroupSection(StringBuilder sb, Group group, Project project) {
        Map<User, Double> scores = buildMemberScores(group, project);
        double avg                = average(scores.values());

        sb.append("NHÓM: ").append(group.getName()).append("\n")
                .append("------------------------------\n")
                .append(scores.isEmpty() ? "Không có thành viên trong nhóm.\n\n" : "");

        if (scores.isEmpty()) return;

        sb.append("Điểm đóng góp trung bình nhóm: ")
                .append(String.format("%.2f", avg)).append("\n")
                .append(String.format("%-30s %-15s %-15s %-15s\n", "THÀNH VIÊN", "ĐIỂM", "% TRUNG BÌNH", "TRẠNG THÁI"))
                .append("----------------------------------------------------------------------\n");

        scores.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .forEach(e -> appendMemberLine(sb, e.getKey(), e.getValue(), avg, project.getFreeriderThreshold()));

        sb.append("\n\n");
    }

    private void appendMemberLine(StringBuilder sb, User user, double score, double avg, double threshold) {
        double percent = avg > 0 ? (score / avg) * 100 : 0;
        String status  = percent < threshold * 100 ? "CÓ RỦI RO CAO" : percent < 70 ? "CÓ RỦI RO" : "BÌNH THƯỜNG";
        sb.append(String.format("%-30s %-15.2f %-15.2f %-15s\n", user.getUsername(), score, percent, status));
    }

    // =============================== HELPER: EVIDENCE COLLECTORS ===============================

    private Map<String, Object> collectFreeRiderEvidence(User user, Project project) {
        Map<String, Object> evidence = new HashMap<>();

        double userScore = getContributionScore(user, project);
        Group  group     = findUserGroup(project, user).orElse(null);
        double groupAvg  = group == null ? 0 : average(buildMemberScores(group, project).values());

        evidence.put("calculatedScore", userScore);
        evidence.put("groupAverageScore", groupAvg);
        evidence.put("percentageBelowAverage", groupAvg > 0 ? (1 - (userScore / groupAvg)) * 100 : 0);
        evidence.put("taskEvidence", collectTaskEvidence(user, project));
        evidence.put("commitEvidence", collectCommitEvidence(user, project));
        evidence.put("peerReviewEvidence", collectPeerReviewEvidence(user, project));
        return evidence;
    }

    private Map<String, Object> collectTaskEvidence(User user, Project project) {
        Map<String, Object> map = new HashMap<>();
        Group group = groupRepository.findByProjectAndMembersContains(project, user);

        List<Task> allTasks       = taskRepository.findByGroupAndAssignee(group, user);
        List<Task> completed      = taskRepository.findByAssigneeAndGroupProjectAndStatus(user, project, TaskStatus.COMPLETED);
        List<Task> overdue        = taskRepository.findOverdueTasksByAssigneeAndProject(user, project, LocalDate.now(), TaskStatus.COMPLETED);

        map.put("totalTasks", allTasks.size());
        map.put("completedTasks", completed.size());
        map.put("completionPercentage", allTasks.isEmpty() ? 0d : (double) completed.size() / allTasks.size() * 100);
        map.put("lateTasks", overdue.size());
        return map;
    }

    private Map<String, Object> collectCommitEvidence(User user, Project project) {
        Map<String, Object> map = new HashMap<>();
        long userCommits = commitRecordRepository.countByProjectIdAndAuthorEmailAndIsValidTrue(project.getId(), user.getEmail());

        List<User> others = groupRepository.findByProject(project).stream()
                .flatMap(g -> getGroupMembers(g).stream())
                .filter(u -> !u.getId().equals(user.getId()))
                .distinct()
                .toList();

        double avgCommits = others.stream()
                .mapToLong(u -> commitRecordRepository.countByProjectIdAndAuthorEmailAndIsValidTrue(project.getId(), u.getEmail()))
                .average().orElse(0d);

        map.put("totalCommits", userCommits);
        map.put("percentageOfGroupAverage", avgCommits == 0 ? 0d : (userCommits / avgCommits) * 100);
        return map;
    }

    private Map<String, Object> collectPeerReviewEvidence(User user, Project project) {
        Map<String, Object> map = new HashMap<>();
        Double avgRating = Optional.ofNullable(peerReviewRepository.findAverageScoreByRevieweeAndProject(user, project)).orElse(0d);

        List<PeerReview> reviews = peerReviewRepository.findByRevieweeAndProject(user, project);
        int lowRatings           = (int) reviews.stream()
                .filter(r -> r.getScore() < 3 && r.getIsCompleted() && r.getIsValid())
                .count();

        List<String> feedback = reviews.stream()
                .map(PeerReview::getComment)
                .filter(c -> c != null && !c.trim().isEmpty())
                .toList();

        map.put("averageRating", avgRating);
        map.put("lowRatingCount", lowRatings);
        map.put("feedback", feedback);
        return map;
    }

    // =============================== HELPER: GROUP EVIDENCE (DASHBOARD) ===============================

    private Map<String, Object> buildGroupEvidence(Project project, List<Group> groups) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> memberList  = new ArrayList<>();
        List<Map<String, Object>> taskStats   = new ArrayList<>();
        List<Map<String, Object>> commitStats = new ArrayList<>();
        List<Map<String, Object>> peerStats   = new ArrayList<>();
        List<Map<String, Object>> weekly      = buildWeekSkeleton();

        // Iterate through each group and its members
        for (Group group: groups){
            for (User member: getGroupMembers(group)){
                Map<String, Object> evidence = collectFreeRiderEvidence(member, project);
                double userScore = evidence.get("calculatedScore") instanceof Number ?
                        ((Number) evidence.get("calculatedScore")).doubleValue() : 0.0;
                double avgScore = evidence.get("groupAverageScore") instanceof Number ?
                        ((Number) evidence.get("groupAverageScore")).doubleValue() : 0.0;
                boolean isFreeRider = userScore < project.getFreeriderThreshold() * avgScore;

                Map<String, Object> memberData = new HashMap<>();
                memberData.put("id", member.getId());
                memberData.put("name", member.getFullName());
                memberData.put("username", member.getUsername());
                memberData.put("contributionScore", userScore);                memberData.put("isFreeRider", isFreeRider);
                memberList.add(memberData);
                @SuppressWarnings("unchecked")
                Map<String, Object> t = (Map<String, Object>) evidence.get("taskEvidence");
                Map<String, Object> taskData = new HashMap<>();
                taskData.put("name", member.getFullName());
                taskData.put("percentage", t.get("completionPercentage"));
                taskStats.add(taskData);
                @SuppressWarnings("unchecked")
                Map<String, Object> c = (Map<String, Object>) evidence.get("commitEvidence");
                Map<String, Object> commitData = new HashMap<>();
                commitData.put("name", member.getFullName());
                commitData.put("commits", c.get("totalCommits"));
                commitData.put("percentage", c.get("percentageOfGroupAverage"));
                commitStats.add(commitData);
                @SuppressWarnings("unchecked")
                Map<String, Object> p = (Map<String, Object>) evidence.get("peerReviewEvidence");
                Map<String, Object> peerData = new HashMap<>();
                peerData.put("name", member.getFullName());
                peerData.put("rating", p.get("averageRating"));
                peerStats.add(peerData);

                fillWeeklyCommits(weekly, group, member);
            }
        }

        Map<String, Object> projectData = new HashMap<>();
        projectData.put("id", project.getId());
        projectData.put("name", project.getName());
        projectData.put("freeriderThreshold", project.getFreeriderThreshold());
        result.put("project", projectData);
        result.put("groupMembers", memberList);
        result.put("taskCompletionStats", taskStats);
        result.put("commitStats", commitStats);
        result.put("peerReviewStats", peerStats);
        result.put("weeklyContribution", weekly);
        return result;
    }    
    
    private List<Map<String, Object>> buildWeekSkeleton() {
        List<Map<String, Object>> weeks = new ArrayList<>();
        for (int i = WEEKS_TO_ANALYSE - 1; i >= 0; i--) {
            weeks.add(new HashMap<>(Map.of("week", "Tuần " + (WEEKS_TO_ANALYSE - i))));
        }
        return weeks;
    }
    
    private void fillWeeklyCommits(List<Map<String, Object>> weeks, Group group, User member) {
        LocalDateTime now = LocalDateTime.now();
        for (int i = 0; i < WEEKS_TO_ANALYSE; i++) {
            LocalDateTime start = now.minusWeeks(WEEKS_TO_ANALYSE - 1 - i).with(DayOfWeek.MONDAY);
            LocalDateTime end   = start.plusWeeks(1);
            double commits = commitRecordRepository.findByGroupAndTimestampBetween(group, start, end).stream()
                    .filter(c -> c.getAuthorEmail().equals(member.getEmail()) && c.isValid())
                    .count();
            weeks.get(i).put(member.getFullName(), commits);
        }
    }
        
    @Override
    public List<FreeRiderCaseDTO> getFreeRiderCases(Long projectId) {
        // Validate project exists before fetching cases
        projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));
        
        List<FreeRiderCase> cases = freeRiderCaseRepository.findByProject_Id(projectId);
        return freeRiderCaseConverter.toDTO(cases);
    }
      
    @Override
    public FreeRiderCaseDTO createFreeRiderCase(Long userId, Long projectId) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));
        
        // Check if an active case already exists
        if (freeRiderCaseRepository.existsActiveCase(projectId, userId)) {
            throw new IllegalStateException("An active case already exists for this user in this project");
        }
        // Get user's group in the project
        Group group = groupRepository.findByProjectAndMembersContains(project, student);
        if (group == null) {
            throw new NotFoundException("User is not part of any group in this project");
        }
        // Get evidence data
        Map<String, Object> evidence = getFreeRiderEvidence(userId, projectId);
        
        try {
            // Convert evidence to JSON string
            String evidenceJson = objectMapper.writeValueAsString(evidence);
            
            // Create new case
            FreeRiderCase freeRiderCase = FreeRiderCase.builder()
                    .student(student)
                    .project(project)
                    .group(group)
                    .status("pending")
                    .detectedAt(LocalDateTime.now())
                    .evidenceJson(evidenceJson)
                    .build();
            
            // Save and convert to DTO
            FreeRiderCase savedCase = freeRiderCaseRepository.save(freeRiderCase);
            return freeRiderCaseConverter.toDTO(savedCase);
        } catch (Exception e) {
            log.error("Error creating free rider case: ", e);
            throw new RuntimeException("Error creating free rider case", e);
        }
    }
      
    @Override
    public FreeRiderCaseDTO resolveFreeRiderCase(Long caseId, String resolution, String notes) {
        FreeRiderCase freeRiderCase = freeRiderCaseRepository.findById(caseId)
                .orElseThrow(() -> new NotFoundException("Free rider case not found"));
        
        // Update case
        freeRiderCase.setStatus("resolved");
        freeRiderCase.setResolution(resolution);
        freeRiderCase.setNotes(notes);
        freeRiderCase.setResolvedAt(LocalDateTime.now());
        
        // Save and convert to DTO
        FreeRiderCase updatedCase = freeRiderCaseRepository.save(freeRiderCase);
        return freeRiderCaseConverter.toDTO(updatedCase);
    }
}
