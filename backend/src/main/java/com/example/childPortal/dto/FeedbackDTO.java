package com.example.childPortal.dto;

import com.example.childPortal.model.Feedback.Category;
import com.example.childPortal.model.Feedback.FeedbackStatus;
import com.example.childPortal.model.Feedback.FeedbackType;
import com.example.childPortal.model.Feedback.Privacy;

import java.time.LocalDateTime;

public class FeedbackDTO {
    private String id;
    private String userId;
    private String caseId;
    private String helpRequestId;
    private String serviceOfferId;

    private FeedbackType feedbackType;
    private String feedbackText;
    private Integer ratingStars;      
    private Category category;
    private Privacy privacy;
    private FeedbackStatus status;
    private boolean anonymous;

    private String adminResponse;
    private String respondedBy;
    private LocalDateTime responseDate;

    private LocalDateTime submissionDate;
    private LocalDateTime lastUpdated;

    // extra presentation fields
    private String formattedDate;
    private String ratingStarsDisplay;
    private String userType;
    private String caseTitle;
    private String assignedToName;
    private String assignedToRole;
    private String responseStatus;
    private String trackingId;

    public FeedbackDTO() {}

    // -- getters / setters --

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }

    public String getServiceOfferId() { return serviceOfferId; }
    public void setServiceOfferId(String serviceOfferId) { this.serviceOfferId = serviceOfferId; }

    public FeedbackType getFeedbackType() { return feedbackType; }
    public void setFeedbackType(FeedbackType feedbackType) { this.feedbackType = feedbackType; }

    public String getFeedbackText() { return feedbackText; }
    public void setFeedbackText(String feedbackText) { this.feedbackText = feedbackText; }

    public Integer getRatingStars() { return ratingStars; }
    public void setRatingStars(Integer ratingStars) { this.ratingStars = ratingStars; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Privacy getPrivacy() { return privacy; }
    public void setPrivacy(Privacy privacy) { this.privacy = privacy; }

    public FeedbackStatus getStatus() { return status; }
    public void setStatus(FeedbackStatus status) { this.status = status; }

    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }

    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }

    public String getRespondedBy() { return respondedBy; }
    public void setRespondedBy(String respondedBy) { this.respondedBy = respondedBy; }

    public LocalDateTime getResponseDate() { return responseDate; }
    public void setResponseDate(LocalDateTime responseDate) { this.responseDate = responseDate; }

    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getFormattedDate() { return formattedDate; }
    public void setFormattedDate(String formattedDate) { this.formattedDate = formattedDate; }

    public String getRatingStarsDisplay() { return ratingStarsDisplay; }
    public void setRatingStarsDisplay(String ratingStarsDisplay) { this.ratingStarsDisplay = ratingStarsDisplay; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public String getCaseTitle() { return caseTitle; }
    public void setCaseTitle(String caseTitle) { this.caseTitle = caseTitle; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public String getAssignedToRole() { return assignedToRole; }
    public void setAssignedToRole(String assignedToRole) { this.assignedToRole = assignedToRole; }

    public String getResponseStatus() { return responseStatus; }
    public void setResponseStatus(String responseStatus) { this.responseStatus = responseStatus; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
}
