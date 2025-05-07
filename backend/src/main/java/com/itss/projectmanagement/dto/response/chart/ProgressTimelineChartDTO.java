package com.itss.projectmanagement.dto.response.chart;

import java.util.List;

import lombok.Data;

@Data
public class ProgressTimelineChartDTO {
    private List<ProgressPoint> timeline;

    @Data
    public static class ProgressPoint {
        private String date;
        private double progressPercent;
    }
}
