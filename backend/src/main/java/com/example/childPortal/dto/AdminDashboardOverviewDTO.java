package com.example.childPortal.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardOverviewDTO {
    private DashboardMetricsDTO metrics;
    private List<CaseDTO> recentCases;
    private List<HelpRequestDTO> recentHelpRequests;
    private List<Map<String, Object>> pendingTransfers; // Or a specific DTO if available

    public DashboardMetricsDTO getMetrics() {
        return metrics;
    }

    public void setMetrics(DashboardMetricsDTO metrics) {
        this.metrics = metrics;
    }

    public List<CaseDTO> getRecentCases() {
        return recentCases;
    }

    public void setRecentCases(List<CaseDTO> recentCases) {
        this.recentCases = recentCases;
    }

    public List<HelpRequestDTO> getRecentHelpRequests() {
        return recentHelpRequests;
    }

    public void setRecentHelpRequests(List<HelpRequestDTO> recentHelpRequests) {
        this.recentHelpRequests = recentHelpRequests;
    }

    public List<java.util.Map<String, Object>> getPendingTransfers() {
        return pendingTransfers;
    }

    public void setPendingTransfers(List<java.util.Map<String, Object>> pendingTransfers) {
        this.pendingTransfers = pendingTransfers;
    }
}
