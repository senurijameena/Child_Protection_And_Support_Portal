package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "feedbacks")
public class Feedback {
    @Id
    private String id;
    private String userId;
    private String caseId;
    private String helpRequestId;
    
    private FeedbackType type;
    private String message;
    private Integer rating; // 1-5 stars
    private String category;
    
    private FeedbackStatus status;
    private String adminResponse;
    private boolean anonymous;
    
    private LocalDateTime submissionDate;
    private LocalDateTime responseDate;

    public enum FeedbackType {
        CASE,
        HELP_REQUEST,
        SERVICE,
        SYSTEM,
        GENERAL
    }

    public enum FeedbackStatus {
        SUBMITTED,
        REVIEWED,
        RESPONDED,
        RESOLVED
    }

    public Feedback() {
        this.submissionDate = LocalDateTime.now();
        this.status = FeedbackStatus.SUBMITTED;
    }

    // Getters and setters
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
    public FeedbackStatus getStatus() { return status; }
    public void setStatus(FeedbackStatus status) { this.status = status; }
    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }
    public LocalDateTime getResponseDate() { return responseDate; }
    public void setResponseDate(LocalDateTime responseDate) { this.responseDate = responseDate; }
}