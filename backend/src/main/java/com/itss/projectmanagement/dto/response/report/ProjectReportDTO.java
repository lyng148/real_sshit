package com.itss.projectmanagement.dto.response.report;

import java.util.List;

import lombok.Data;

@Data
public class ProjectReportDTO {
    private Long projectId;
    private String projectName;
    private List<MemberReport> members;

    @Data
    public static class MemberReport {
        private Long memberId;
        private String memberName;
        private int commitCount;
        private double contributionScore;
        private int completedTasks;
        private int lateTasks;
        private double peerReviewAvg;
    }
}
