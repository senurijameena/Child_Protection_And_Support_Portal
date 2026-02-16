package com.example.childPortal.dto;

public class ResolutionRateDTO {
    private double caseResolutionRate;
    private double helpRequestResolutionRate;
    private double overallResolutionRate;
    private long totalCases;
    private long resolvedCases;
    private long totalHelpRequests;
    private long resolvedHelpRequests;
    private double averageResolutionTime;

    public double getCaseResolutionRate() {
        return caseResolutionRate;
    }

    public void setCaseResolutionRate(double caseResolutionRate) {
        this.caseResolutionRate = caseResolutionRate;
    }

    public double getHelpRequestResolutionRate() {
        return helpRequestResolutionRate;
    }

    public void setHelpRequestResolutionRate(double helpRequestResolutionRate) {
        this.helpRequestResolutionRate = helpRequestResolutionRate;
    }

    public double getOverallResolutionRate() {
        return overallResolutionRate;
    }

    public void setOverallResolutionRate(double overallResolutionRate) {
        this.overallResolutionRate = overallResolutionRate;
    }

    public long getTotalCases() {
        return totalCases;
    }

    public void setTotalCases(long totalCases) {
        this.totalCases = totalCases;
    }

    public long getResolvedCases() {
        return resolvedCases;
    }

    public void setResolvedCases(long resolvedCases) {
        this.resolvedCases = resolvedCases;
    }

    public long getTotalHelpRequests() {
        return totalHelpRequests;
    }

    public void setTotalHelpRequests(long totalHelpRequests) {
        this.totalHelpRequests = totalHelpRequests;
    }

    public long getResolvedHelpRequests() {
        return resolvedHelpRequests;
    }

    public void setResolvedHelpRequests(long resolvedHelpRequests) {
        this.resolvedHelpRequests = resolvedHelpRequests;
    }

    public double getAverageResolutionTime() {
        return averageResolutionTime;
    }

    public void setAverageResolutionTime(double averageResolutionTime) {
        this.averageResolutionTime = averageResolutionTime;
    }
}

