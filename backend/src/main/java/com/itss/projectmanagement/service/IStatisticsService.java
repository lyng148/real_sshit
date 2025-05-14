package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.project.ProjectStatisticsDTO;

public interface IStatisticsService {
    ProjectStatisticsDTO getProjectStatistics(Long projectId);
}