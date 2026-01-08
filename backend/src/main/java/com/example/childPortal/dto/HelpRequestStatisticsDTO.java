package com.example.childPortal.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class HelpRequestStatisticsDTO {
    private long totalRequests;
    private long pendingRequests;
    private long activeRequests;
    private long completedRequests;
    private long urgentRequests;
    private double averageResponseTime;
    private Map<String, Long> requestsByType;
    private Map<String, Long> requestsByStatus;
    private Map<String, Long> requestsByUrgency;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getActiveRequests() {
        return activeRequests;
    }

    public void setActiveRequests(long activeRequests) {
        this.activeRequests = activeRequests;
    }

    public long getCompletedRequests() {
        return completedRequests;
    }

    public void setCompletedRequests(long completedRequests) {
        this.completedRequests = completedRequests;
    }

    public long getUrgentRequests() {
        return urgentRequests;
    }

    public void setUrgentRequests(long urgentRequests) {
        this.urgentRequests = urgentRequests;
    }

    public double getAverageResponseTime() {
        return averageResponseTime;
    }

    public void setAverageResponseTime(double averageResponseTime) {
        this.averageResponseTime = averageResponseTime;
    }

    public Map<String, Long> getRequestsByType() {
        return requestsByType;
    }

    public void setRequestsByType(Map<String, Long> requestsByType) {
        this.requestsByType = requestsByType;
    }

    public Map<String, Long> getRequestsByStatus() {
        return requestsByStatus;
    }

    public void setRequestsByStatus(Map<String, Long> requestsByStatus) {
        this.requestsByStatus = requestsByStatus;
    }

    public Map<String, Long> getRequestsByUrgency() {
        return requestsByUrgency;
    }

    public void setRequestsByUrgency(Map<String, Long> requestsByUrgency) {
        this.requestsByUrgency = requestsByUrgency;
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

