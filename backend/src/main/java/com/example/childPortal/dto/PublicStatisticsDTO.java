package com.example.childPortal.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class PublicStatisticsDTO {
    private long totalCasesReported;
    private long activeCases;
    private long casesSaved; // Resolved + Closed cases
    private double caseResolutionRate; // Percentage of resolved cases
    private long helpRequestsCompleted;
    private long childrenSupported;
    private Map<String, Long> caseTypeDistribution;
    private List<MonthlyActivityDTO> monthlyActivity;
    private String lastUpdated;

    public long getTotalCasesReported() {
        return totalCasesReported;
    }

    public void setTotalCasesReported(long totalCasesReported) {
        this.totalCasesReported = totalCasesReported;
    }

    public long getActiveCases() {
        return activeCases;
    }

    public void setActiveCases(long activeCases) {
        this.activeCases = activeCases;
    }

    public long getHelpRequestsCompleted() {
        return helpRequestsCompleted;
    }

    public void setHelpRequestsCompleted(long helpRequestsCompleted) {
        this.helpRequestsCompleted = helpRequestsCompleted;
    }

    public long getChildrenSupported() {
        return childrenSupported;
    }

    public void setChildrenSupported(long childrenSupported) {
        this.childrenSupported = childrenSupported;
    }

    public Map<String, Long> getCaseTypeDistribution() {
        return caseTypeDistribution;
    }

    public void setCaseTypeDistribution(Map<String, Long> caseTypeDistribution) {
        this.caseTypeDistribution = caseTypeDistribution;
    }

    public List<MonthlyActivityDTO> getMonthlyActivity() {
        return monthlyActivity;
    }

    public void setMonthlyActivity(List<MonthlyActivityDTO> monthlyActivity) {
        this.monthlyActivity = monthlyActivity;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public long getCasesSaved() {
        return casesSaved;
    }

    public void setCasesSaved(long casesSaved) {
        this.casesSaved = casesSaved;
    }

    public double getCaseResolutionRate() {
        return caseResolutionRate;
    }

    public void setCaseResolutionRate(double caseResolutionRate) {
        this.caseResolutionRate = caseResolutionRate;
    }

    private long publicUsersCount;
    private long socialWorkersCount;
    private long policeOfficersCount;

    public long getPublicUsersCount() {
        return publicUsersCount;
    }

    public void setPublicUsersCount(long publicUsersCount) {
        this.publicUsersCount = publicUsersCount;
    }

    public long getSocialWorkersCount() {
        return socialWorkersCount;
    }

    public void setSocialWorkersCount(long socialWorkersCount) {
        this.socialWorkersCount = socialWorkersCount;
    }

    public long getPoliceOfficersCount() {
        return policeOfficersCount;
    }

    public void setPoliceOfficersCount(long policeOfficersCount) {
        this.policeOfficersCount = policeOfficersCount;
    }
}
