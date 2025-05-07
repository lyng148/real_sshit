package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.chart.CommitCountChartDTO;
import com.itss.projectmanagement.dto.response.chart.ProgressTimelineChartDTO;
import com.itss.projectmanagement.dto.response.chart.ContributionPieChartDTO;

public interface ChartService {
    CommitCountChartDTO getCommitCountChart(Long projectId, String rangeType);
    ProgressTimelineChartDTO getProgressTimelineChart(Long projectId, String rangeType);
    ContributionPieChartDTO getContributionPieChart(Long projectId, String rangeType);
}
