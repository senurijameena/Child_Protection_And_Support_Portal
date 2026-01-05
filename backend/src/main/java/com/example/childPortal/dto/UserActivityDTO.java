package com.example.childPortal.dto;

public class UserActivityDTO {
    private String userId;
    private String userName;
    private String role;
    private long casesHandled;
    private long helpRequestsHandled;
    private long transfersRequested;
    private long transfersApproved;
    private long feedbackSubmitted;
    private double averageRating;
    private long totalActivity;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getCasesHandled() {
        return casesHandled;
    }

    public void setCasesHandled(long casesHandled) {
        this.casesHandled = casesHandled;
    }

    public long getHelpRequestsHandled() {
        return helpRequestsHandled;
    }

    public void setHelpRequestsHandled(long helpRequestsHandled) {
        this.helpRequestsHandled = helpRequestsHandled;
    }

    public long getTransfersRequested() {
        return transfersRequested;
    }

    public void setTransfersRequested(long transfersRequested) {
        this.transfersRequested = transfersRequested;
    }

    public long getTransfersApproved() {
        return transfersApproved;
    }

    public void setTransfersApproved(long transfersApproved) {
        this.transfersApproved = transfersApproved;
    }

    public long getFeedbackSubmitted() {
        return feedbackSubmitted;
    }

    public void setFeedbackSubmitted(long feedbackSubmitted) {
        this.feedbackSubmitted = feedbackSubmitted;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalActivity() {
        return totalActivity;
    }

    public void setTotalActivity(long totalActivity) {
        this.totalActivity = totalActivity;
    }
}

