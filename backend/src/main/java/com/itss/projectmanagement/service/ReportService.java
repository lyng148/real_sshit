package com.itss.projectmanagement.service;

import com.itss.projectmanagement.dto.response.report.ProjectReportDTO;

public interface ReportService {
    ProjectReportDTO getProjectReport(Long projectId);
}
