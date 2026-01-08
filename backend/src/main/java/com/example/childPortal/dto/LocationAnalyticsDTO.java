package com.example.childPortal.dto;

public class LocationAnalyticsDTO {
    private String location;
    private String city;
    private String state;
    private long totalCases;
    private long activeCases;
    private long totalHelpRequests;
    private long pendingHelpRequests;
    private double averageResponseTime;
    private double resolutionRate;

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

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

    public double getAverageResponseTime() {
        return averageResponseTime;
    }

    public void setAverageResponseTime(double averageResponseTime) {
        this.averageResponseTime = averageResponseTime;
    }

    public double getResolutionRate() {
        return resolutionRate;
    }

    public void setResolutionRate(double resolutionRate) {
        this.resolutionRate = resolutionRate;
    }
}

