package com.itss.projectmanagement.service.impl;

import com.itss.projectmanagement.entity.ContributionScore;
import com.itss.projectmanagement.entity.Group;
import com.itss.projectmanagement.entity.Project;
import com.itss.projectmanagement.entity.User;
import com.itss.projectmanagement.exception.NotFoundException;
import com.itss.projectmanagement.repository.ContributionScoreRepository;
import com.itss.projectmanagement.repository.GroupRepository;
import com.itss.projectmanagement.repository.ProjectRepository;
import com.itss.projectmanagement.repository.UserRepository;
import com.itss.projectmanagement.service.IFreeRiderDetectionService;
import com.itss.projectmanagement.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FreeRiderDetectionServiceImpl implements IFreeRiderDetectionService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ContributionScoreRepository contributionScoreRepository;
    private final GroupRepository groupRepository;
    private final INotificationService notificationService;
    
    @Override
    public List<User> detectFreeRiders(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        // Lấy danh sách tất cả các nhóm trong dự án
        List<Group> projectGroups = groupRepository.findByProject(project);
        List<User> freeRiders = new ArrayList<>();
        
        // Sử dụng ngưỡng từ đối tượng project
        double threshold = project.getFreeriderThreshold();
        
        // Xử lý theo từng nhóm
        for (Group group : projectGroups) {
            // Lấy danh sách thành viên nhóm (bao gồm cả nhóm trưởng)
            List<User> members = new ArrayList<>(group.getMembers());
            if (group.getLeader() != null && !members.contains(group.getLeader())) {
                members.add(group.getLeader());
            }
            
            if (members.isEmpty()) {
                continue;
            }
            
            // Tính điểm đóng góp trung bình của nhóm
            double totalScore = 0;
            Map<User, Double> memberScores = new HashMap<>();
            
            for (User member : members) {
                Optional<ContributionScore> scoreOpt = contributionScoreRepository.findByUserAndProject(member, project);
                if (scoreOpt.isPresent()) {
                    double score = scoreOpt.get().getCalculatedScore();
                    totalScore += score;
                    memberScores.put(member, score);
                } else {
                    memberScores.put(member, 0.0);
                }
            }

            double averageScore = totalScore / members.size();
            log.info("Group {}: Average contribution score = {}", group.getName(), averageScore);
            
            // Phát hiện thành viên "tự do" dựa vào ngưỡng so với điểm trung bình nhóm
            for (Map.Entry<User, Double> entry : memberScores.entrySet()) {
                User user = entry.getKey();
                Double score = entry.getValue();
                
                // Nếu điểm đóng góp < ngưỡng * điểm trung bình, coi là "tự do"
                if (score < threshold * averageScore) {
                    freeRiders.add(user);
                    log.info("Detected free rider: {} in group {} - Score: {} (Group average: {})",
                            user.getUsername(), group.getName(), score, averageScore);
                }
            }
        }
        
        // Nếu phát hiện thành viên "tự do", gửi thông báo
        if (!freeRiders.isEmpty()) {
            // Thông báo cho người hướng dẫn
            String title = "Phát hiện thành viên \"tự do\" trong dự án " + project.getName();
            StringBuilder message = new StringBuilder();
            message.append("Hệ thống đã phát hiện ").append(freeRiders.size())
                   .append(" thành viên có nguy cơ là thành viên \"tự do\" (free-rider) trong dự án ")
                   .append(project.getName()).append(":\n\n");
            
            for (User user : freeRiders) {
                message.append("- ").append(user.getUsername()).append(" (")
                       .append(user.getEmail()).append(")\n");
                
                Optional<ContributionScore> scoreOpt = contributionScoreRepository.findByUserAndProject(user, project);
                double userScore = scoreOpt.map(ContributionScore::getCalculatedScore).orElse(0.0);
                
                message.append("  Điểm đóng góp: ").append(String.format("%.2f", userScore))
                       .append(" (dưới ").append(String.format("%.0f", threshold * 100))
                       .append("% điểm trung bình nhóm)\n");
            }
            
            message.append("\nVui lòng xem báo cáo chi tiết trong hệ thống.");
            
            if (project.getInstructor() != null) {
                notificationService.notifyUser(project.getInstructor(), title, message.toString());
            }
            
            // Thông báo cho nhóm trưởng
            String leaderTitle = "Cảnh báo thành viên \"tự do\" trong nhóm của bạn";
            notificationService.notifyProjectLeaders(project, leaderTitle, message.toString());
        }
        
        return freeRiders;
    }

    @Override
    public Map<Long, Double> getFreeRiderRiskScores(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        // Lấy danh sách tất cả các nhóm trong dự án
        List<Group> projectGroups = groupRepository.findByProject(project);
        Map<Long, Double> riskScores = new HashMap<>();
        
        // Xử lý theo từng nhóm
        for (Group group : projectGroups) {
            // Lấy danh sách thành viên nhóm (bao gồm cả nhóm trưởng)
            List<User> members = new ArrayList<>(group.getMembers());
            if (group.getLeader() != null && !members.contains(group.getLeader())) {
                members.add(group.getLeader());
            }
            
            if (members.isEmpty()) {
                continue;
            }
            
            // Tính điểm đóng góp trung bình của nhóm
            double totalScore = 0;
            Map<User, Double> memberScores = new HashMap<>();
            
            for (User member : members) {
                Optional<ContributionScore> scoreOpt = contributionScoreRepository.findByUserAndProject(member, project);
                if (scoreOpt.isPresent()) {
                    double score = scoreOpt.get().getCalculatedScore();
                    totalScore += score;
                    memberScores.put(member, score);
                } else {
                    memberScores.put(member, 0.0);
                }
            }
            
            double averageScore = totalScore / members.size();
            log.info("Group {}: Average contribution score = {}", group.getName(), averageScore);
            // Tính điểm rủi ro "tự do" cho mỗi thành viên
            for (Map.Entry<User, Double> entry : memberScores.entrySet()) {
                User user = entry.getKey();
                Double score = entry.getValue();
                
                // Tính điểm rủi ro dựa trên mức chênh lệch với điểm trung bình nhóm
                // Giá trị cao hơn đồng nghĩa với rủi ro cao hơn (thang 0-1)
                double riskScore;
                if (averageScore <= 0) {
                    riskScore = 0.5; // Giá trị mặc định nếu điểm trung bình = 0
                } else {
                    // Công thức: 1 - (điểm cá nhân / điểm trung bình)
                    // Giới hạn giá trị từ 0 đến 1
                    riskScore = Math.min(1.0, Math.max(0.0, 1.0 - (score / averageScore)));
                }
                
                riskScores.put(user.getId(), riskScore);
            }
        }
        
        return riskScores;
    }

    @Override
    public Double calculateFreeRiderRiskScore(Long userId, Long projectId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with ID: " + userId));
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        // Tìm nhóm của người dùng trong dự án
        Group userGroup = null;
        for (Group group : groupRepository.findByProject(project)) {
            if (group.getMembers().contains(user) || 
                (group.getLeader() != null && group.getLeader().getId().equals(userId))) {
                userGroup = group;
                break;
            }
        }
        
        if (userGroup == null) {
            throw new NotFoundException("User is not a member of any group in this project");
        }
        
        // Lấy danh sách thành viên nhóm
        List<User> members = new ArrayList<>(userGroup.getMembers());
        if (userGroup.getLeader() != null && !members.contains(userGroup.getLeader())) {
            members.add(userGroup.getLeader());
        }
        
        // Tính điểm đóng góp trung bình của nhóm
        double totalScore = 0;
        double userScore = 0;
        
        for (User member : members) {
            Optional<ContributionScore> scoreOpt = contributionScoreRepository.findByUserAndProject(member, project);
            if (scoreOpt.isPresent()) {
                double score = scoreOpt.get().getCalculatedScore();
                totalScore += score;
                
                if (member.getId().equals(userId)) {
                    userScore = score;
                }
            }
        }

        return getRiskScore(members, totalScore, userScore);
    }

    private static double getRiskScore(List<User> members, double totalScore, double userScore) {
        double averageScore = !members.isEmpty() ? totalScore / members.size() : 0;

        // Tính điểm rủi ro dựa trên mức chênh lệch với điểm trung bình nhóm
        double riskScore;
        if (averageScore <= 0) {
            riskScore = 0.5; // Giá trị mặc định nếu điểm trung bình = 0
        } else {
            // Công thức: 1 - (điểm cá nhân / điểm trung bình)
            // Giới hạn giá trị từ 0 đến 1
            riskScore = Math.min(1.0, Math.max(0.0, 1.0 - (userScore / averageScore)));
        }
        return riskScore;
    }

    @Override
    public String generateFreeRiderReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with ID: " + projectId));
        
        StringBuilder report = new StringBuilder();
        report.append("BÁO CÁO PHÁT HIỆN THÀNH VIÊN \"TỰ DO\" CHO DỰ ÁN: ").append(project.getName()).append("\n\n");
        
        report.append("Cấu hình phát hiện:\n");
        report.append("- Ngưỡng phát hiện: ").append(String.format("%.0f%%", project.getFreeriderThreshold() * 100));
        report.append(" của điểm trung bình nhóm\n\n");
        
        // Lấy danh sách tất cả các nhóm trong dự án
        List<Group> projectGroups = groupRepository.findByProject(project);
        
        for (Group group : projectGroups) {
            report.append("NHÓM: ").append(group.getName()).append("\n");
            report.append("------------------------------\n");
            
            // Lấy danh sách thành viên nhóm
            List<User> members = new ArrayList<>(group.getMembers());
            if (group.getLeader() != null && !members.contains(group.getLeader())) {
                members.add(group.getLeader());
            }
            
            if (members.isEmpty()) {
                report.append("Không có thành viên trong nhóm.\n\n");
                continue;
            }
            
            // Tính điểm đóng góp trung bình của nhóm
            double totalScore = 0;
            Map<User, Double> memberScores = new HashMap<>();
            
            for (User member : members) {
                Optional<ContributionScore> scoreOpt = contributionScoreRepository.findByUserAndProject(member, project);
                if (scoreOpt.isPresent()) {
                    double score = scoreOpt.get().getCalculatedScore();
                    totalScore += score;
                    memberScores.put(member, score);
                } else {
                    memberScores.put(member, 0.0);
                }
            }
            
            double averageScore = totalScore / members.size();
            report.append("Điểm đóng góp trung bình nhóm: ").append(String.format("%.2f", averageScore)).append("\n");
            report.append(String.format("%-30s %-15s %-15s %-15s\n", "THÀNH VIÊN", "ĐIỂM", "% TRUNG BÌNH", "TRẠNG THÁI"));
            report.append("----------------------------------------------------------------------\n");
            
            // Sắp xếp thành viên theo điểm đóng góp (tăng dần)
            List<Map.Entry<User, Double>> sortedMembers = memberScores.entrySet().stream()
                    .sorted(Map.Entry.comparingByValue())
                    .toList();
            
            for (Map.Entry<User, Double> entry : sortedMembers) {
                User user = entry.getKey();
                Double score = entry.getValue();
                
                // Tính phần trăm so với điểm trung bình
                double percentOfAverage = averageScore > 0 ? (score / averageScore) * 100 : 0;
                
                // Xác định trạng thái
                String status;
                if (percentOfAverage < project.getFreeriderThreshold() * 100) {
                    status = "CÓ RỦI RO CAO";
                } else if (percentOfAverage < 70) {
                    status = "CÓ RỦI RO";
                } else {
                    status = "BÌNH THƯỜNG";
                }
                
                report.append(String.format("%-30s %-15.2f %-15.2f %-15s\n", 
                        user.getUsername(), score, percentOfAverage, status));
            }
            
            report.append("\n\n");
        }
        
        report.append("Báo cáo được tạo tự động bởi hệ thống phát hiện thành viên \"tự do\".\n");
        report.append("Ngày tạo: ").append(new Date()).append("\n");
        
        return report.toString();
    }
}