package com.example.childPortal.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class DashboardMetricsDTO {
    private long totalCases;
    private long activeCases;
    private long emergencyCases;
    private long totalHelpRequests;
    private long pendingHelpRequests;
    private long totalUsers;
    private long pendingApprovals;
    private double averageResponseTime;
    private double caseResolutionRate;
    private Map<String, Long> casesByStatus;
    private Map<String, Long> helpRequestsByType;
    private LocalDateTime lastUpdated;

    public long getTotalCases() {
        return totalCases;
    }

    public void setTotalCases(long totalCases) {
        this.totalCases = totalCases;
    }

    public long getActiveCases() {
        return activeCases;
    }

    public void setActiveCases(long activeCases) {
        this.activeCases = activeCases;
    }

    public long getEmergencyCases() {
        return emergencyCases;
    }

    public void setEmergencyCases(long emergencyCases) {
        this.emergencyCases = emergencyCases;
    }

    public long getTotalHelpRequests() {
        return totalHelpRequests;
    }

    public void setTotalHelpRequests(long totalHelpRequests) {
        this.totalHelpRequests = totalHelpRequests;
    }

    public long getPendingHelpRequests() {
        return pendingHelpRequests;
    }

    public void setPendingHelpRequests(long pendingHelpRequests) {
        this.pendingHelpRequests = pendingHelpRequests;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(long pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }

    public double getAverageResponseTime() {
        return averageResponseTime;
    }

    public void setAverageResponseTime(double averageResponseTime) {
        this.averageResponseTime = averageResponseTime;
    }

    public double getCaseResolutionRate() {
        return caseResolutionRate;
    }

    public void setCaseResolutionRate(double caseResolutionRate) {
        this.caseResolutionRate = caseResolutionRate;
    }

    public Map<String, Long> getCasesByStatus() {
        return casesByStatus;
    }

    public void setCasesByStatus(Map<String, Long> casesByStatus) {
        this.casesByStatus = casesByStatus;
    }

    public Map<String, Long> getHelpRequestsByType() {
        return helpRequestsByType;
    }

    public void setHelpRequestsByType(Map<String, Long> helpRequestsByType) {
        this.helpRequestsByType = helpRequestsByType;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}

