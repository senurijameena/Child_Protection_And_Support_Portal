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
    private String rating; // 1-5 stars
    private String category;
    private String helpfulness;
    private String expectedHelp;
    private String behavior;
    
    private FeedbackStatus status;
    private String adminResponse;
    private String socialWorkerResponse;
    private boolean anonymous;
    
    private LocalDateTime submissionDate;
    private LocalDateTime responseDate;
    private LocalDateTime socialWorkerResponseDate;

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
    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getHelpfulness() { return helpfulness; }
    public void setHelpfulness(String helpfulness) { this.helpfulness = helpfulness; }
    public String getExpectedHelp() { return expectedHelp; }
    public void setExpectedHelp(String expectedHelp) { this.expectedHelp = expectedHelp; }
    public String getBehavior() { return behavior; }
    public void setBehavior(String behavior) { this.behavior = behavior; }
    public FeedbackStatus getStatus() { return status; }
    public void setStatus(FeedbackStatus status) { this.status = status; }
    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }
    public String getSocialWorkerResponse() { return socialWorkerResponse; }
    public void setSocialWorkerResponse(String socialWorkerResponse) { this.socialWorkerResponse = socialWorkerResponse; }
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }
    public LocalDateTime getResponseDate() { return responseDate; }
    public void setResponseDate(LocalDateTime responseDate) { this.responseDate = responseDate; }
    public LocalDateTime getSocialWorkerResponseDate() { return socialWorkerResponseDate; }
    public void setSocialWorkerResponseDate(LocalDateTime socialWorkerResponseDate) { this.socialWorkerResponseDate = socialWorkerResponseDate; }
}
