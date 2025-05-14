package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.report.ProjectReportDTO;

public interface IReportService {
    ProjectReportDTO getProjectReport(Long projectId);
}
