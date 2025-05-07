package com.itss.projectmanagement.dto.response.chart;

import java.util.List;

import lombok.Data;

@Data
public class ContributionPieChartDTO {
    private List<MemberContribution> data;

    @Data
    public static class MemberContribution {
        private Long memberId;
        private String memberName;
        private double contributionPercent;
    }
}
