package com.itss.projectmanagement.dto.response.chart;

import java.util.List;

import lombok.Data;

@Data
public class CommitCountChartDTO {
    private List<MemberCommitCount> data;

    @Data
    public static class MemberCommitCount {
        private Long memberId;
        private String memberName;
        private int commitCount;
    }
}
