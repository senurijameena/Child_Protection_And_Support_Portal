package com.example.childPortal.dto;

import java.time.LocalDateTime;

public class RealtimeUpdatesDTO {
    private DashboardMetricsDTO metrics;
    private LocalDateTime timestamp;
    private long newCasesSinceLastUpdate;
    private long newHelpRequestsSinceLastUpdate;
    private long newUsersSinceLastUpdate;
    private long pendingTransfers;

    public DashboardMetricsDTO getMetrics() {
        return metrics;
    }

    public void setMetrics(DashboardMetricsDTO metrics) {
        this.metrics = metrics;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public long getNewCasesSinceLastUpdate() {
        return newCasesSinceLastUpdate;
    }

    public void setNewCasesSinceLastUpdate(long newCasesSinceLastUpdate) {
        this.newCasesSinceLastUpdate = newCasesSinceLastUpdate;
    }

    public long getNewHelpRequestsSinceLastUpdate() {
        return newHelpRequestsSinceLastUpdate;
    }

    public void setNewHelpRequestsSinceLastUpdate(long newHelpRequestsSinceLastUpdate) {
        this.newHelpRequestsSinceLastUpdate = newHelpRequestsSinceLastUpdate;
    }

    public long getNewUsersSinceLastUpdate() {
        return newUsersSinceLastUpdate;
    }

    public void setNewUsersSinceLastUpdate(long newUsersSinceLastUpdate) {
        this.newUsersSinceLastUpdate = newUsersSinceLastUpdate;
    }

    public long getPendingTransfers() {
        return pendingTransfers;
    }

    public void setPendingTransfers(long pendingTransfers) {
        this.pendingTransfers = pendingTransfers;
    }
}

