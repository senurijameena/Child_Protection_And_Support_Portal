package com.example.childPortal.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ReportRequestDTO {
    private String reportType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String format; // PDF, EXCEL, CSV
    private Map<String, Object> filters;
    private boolean includeCharts;
    private boolean includeDetails;

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public Map<String, Object> getFilters() {
        return filters;
    }

    public void setFilters(Map<String, Object> filters) {
        this.filters = filters;
    }

    public boolean isIncludeCharts() {
        return includeCharts;
    }

    public void setIncludeCharts(boolean includeCharts) {
        this.includeCharts = includeCharts;
    }

    public boolean isIncludeDetails() {
        return includeDetails;
    }

    public void setIncludeDetails(boolean includeDetails) {
        this.includeDetails = includeDetails;
    }
}

