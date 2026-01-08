package com.example.childPortal.dto;

public class ResponseTimeMetricsDTO {
    private double averageCaseResponseTime;
    private double averageHelpRequestResponseTime;
    private double averageTransferResponseTime;
    private double medianCaseResponseTime;
    private double medianHelpRequestResponseTime;
    private double fastestResponseTime;
    private double slowestResponseTime;
    private long totalResponses;

    public double getAverageCaseResponseTime() {
        return averageCaseResponseTime;
    }

    public void setAverageCaseResponseTime(double averageCaseResponseTime) {
        this.averageCaseResponseTime = averageCaseResponseTime;
    }

    public double getAverageHelpRequestResponseTime() {
        return averageHelpRequestResponseTime;
    }

    public void setAverageHelpRequestResponseTime(double averageHelpRequestResponseTime) {
        this.averageHelpRequestResponseTime = averageHelpRequestResponseTime;
    }

    public double getAverageTransferResponseTime() {
        return averageTransferResponseTime;
    }

    public void setAverageTransferResponseTime(double averageTransferResponseTime) {
        this.averageTransferResponseTime = averageTransferResponseTime;
    }

    public double getMedianCaseResponseTime() {
        return medianCaseResponseTime;
    }

    public void setMedianCaseResponseTime(double medianCaseResponseTime) {
        this.medianCaseResponseTime = medianCaseResponseTime;
    }

    public double getMedianHelpRequestResponseTime() {
        return medianHelpRequestResponseTime;
    }

    public void setMedianHelpRequestResponseTime(double medianHelpRequestResponseTime) {
        this.medianHelpRequestResponseTime = medianHelpRequestResponseTime;
    }

    public double getFastestResponseTime() {
        return fastestResponseTime;
    }

    public void setFastestResponseTime(double fastestResponseTime) {
        this.fastestResponseTime = fastestResponseTime;
    }

    public double getSlowestResponseTime() {
        return slowestResponseTime;
    }

    public void setSlowestResponseTime(double slowestResponseTime) {
        this.slowestResponseTime = slowestResponseTime;
    }

    public long getTotalResponses() {
        return totalResponses;
    }

    public void setTotalResponses(long totalResponses) {
        this.totalResponses = totalResponses;
    }
}

