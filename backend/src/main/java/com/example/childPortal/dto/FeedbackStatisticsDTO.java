package com.example.childPortal.dto;

public class FeedbackStatisticsDTO {
    private long totalFeedback;
    private long positiveFeedback;
    private long negativeFeedback;

    public long getTotalFeedback() { return totalFeedback; }
    public void setTotalFeedback(long totalFeedback) { this.totalFeedback = totalFeedback; }

    public long getPositiveFeedback() { return positiveFeedback; }
    public void setPositiveFeedback(long positiveFeedback) { this.positiveFeedback = positiveFeedback; }

    public long getNegativeFeedback() { return negativeFeedback; }
    public void setNegativeFeedback(long negativeFeedback) { this.negativeFeedback = negativeFeedback; }
}

