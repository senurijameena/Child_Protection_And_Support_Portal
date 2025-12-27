package com.example.childPortal.dto;

import com.example.childPortal.model.Feedback.FeedbackType;
import com.example.childPortal.model.Feedback.FeedbackStatus;
import java.time.LocalDateTime;

public class FeedbackFilterDTO {
    private String caseId;
    private String userId;
    private FeedbackType feedbackType;
    private String category;
    private FeedbackStatus status;
    private Integer rating;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String searchText;

    public FeedbackFilterDTO() {}

    // Getters and setters
    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public FeedbackType getFeedbackType() { return feedbackType; }
    public void setFeedbackType(FeedbackType feedbackType) { this.feedbackType = feedbackType; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public FeedbackStatus getStatus() { return status; }
    public void setStatus(FeedbackStatus status) { this.status = status; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public String getSearchText() { return searchText; }
    public void setSearchText(String searchText) { this.searchText = searchText; }
}