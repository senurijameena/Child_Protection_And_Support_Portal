package com.example.childPortal.dto;

import com.example.childPortal.model.Feedback.FeedbackType;
import java.time.LocalDateTime;

public class FeedbackDTO {
    private String id;
    private String userId;
    private String caseId;
    private String helpRequestId;
    private FeedbackType type;
    private String message;
    private Integer rating;
    private String category;
    private String helpfulness;
    private String expectedHelp;
    private String behavior;
    private boolean anonymous;
    private LocalDateTime submissionDate;

    public FeedbackDTO() {}

    public FeedbackDTO(String message, boolean success) {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    public FeedbackType getType() { return type; }
    public void setType(FeedbackType type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getHelpfulness() { return helpfulness; }
    public void setHelpfulness(String helpfulness) { this.helpfulness = helpfulness; }
    public String getExpectedHelp() { return expectedHelp; }
    public void setExpectedHelp(String expectedHelp) { this.expectedHelp = expectedHelp; }
    public String getBehavior() { return behavior; }
    public void setBehavior(String behavior) { this.behavior = behavior; }
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }
}
