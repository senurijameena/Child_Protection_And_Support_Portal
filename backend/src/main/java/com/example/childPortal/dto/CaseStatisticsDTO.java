package com.example.childPortal.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class CaseStatisticsDTO {
    private long totalCases;
    private long activeCases;
    private long resolvedCases;
    private long closedCases;
    private long emergencyCases;
    private double averageResolutionTime;
    private Map<String, Long> casesByType;
    private Map<String, Long> casesByStatus;
    private Map<String, Long> casesByPriority;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

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

    public long getResolvedCases() {
        return resolvedCases;
    }

    public void setResolvedCases(long resolvedCases) {
        this.resolvedCases = resolvedCases;
    }

    public long getClosedCases() {
        return closedCases;
    }

    public void setClosedCases(long closedCases) {
        this.closedCases = closedCases;
    }

    public long getEmergencyCases() {
        return emergencyCases;
    }

    public void setEmergencyCases(long emergencyCases) {
        this.emergencyCases = emergencyCases;
    }

    public double getAverageResolutionTime() {
        return averageResolutionTime;
    }

    public void setAverageResolutionTime(double averageResolutionTime) {
        this.averageResolutionTime = averageResolutionTime;
    }

    public Map<String, Long> getCasesByType() {
        return casesByType;
    }

    public void setCasesByType(Map<String, Long> casesByType) {
        this.casesByType = casesByType;
    }

    public Map<String, Long> getCasesByStatus() {
        return casesByStatus;
    }

    public void setCasesByStatus(Map<String, Long> casesByStatus) {
        this.casesByStatus = casesByStatus;
    }

    public Map<String, Long> getCasesByPriority() {
        return casesByPriority;
    }

    public void setCasesByPriority(Map<String, Long> casesByPriority) {
        this.casesByPriority = casesByPriority;
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
}

