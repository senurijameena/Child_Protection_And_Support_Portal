package com.example.childPortal.dto;

public class UserProfileStatsDTO {
    private long totalCases;
    private long helpRequests;
    private double averageRating;
    private int trustScore;

    public long getTotalCases() {
        return totalCases;
    }

    public void setTotalCases(long totalCases) {
        this.totalCases = totalCases;
    }

    public long getHelpRequests() {
        return helpRequests;
    }

    public void setHelpRequests(long helpRequests) {
        this.helpRequests = helpRequests;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(int trustScore) {
        this.trustScore = trustScore;
    }
}


