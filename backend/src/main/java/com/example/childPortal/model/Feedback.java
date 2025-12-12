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
    private String serviceOfferId; 
    private String adminResponse;
    private FeedbackType feedbackType;
    private String feedbackText; 
    private Integer rating; 
    private Category category; 
    private Privacy privacy; 

    private FeedbackStatus status; 
    private boolean anonymous;

    private String respondedBy; 
    private LocalDateTime responseDate; 

    private LocalDateTime submissionDate;
    private LocalDateTime lastUpdated; 

    public enum FeedbackType { 
        GENERAL,       
        CASE,           
        SERVICE,        
        OFFICER,       
        SOCIAL_WORKER,  
        SYSTEM       
    } 

    public enum Category { 
        SATISFACTION, 
        COMPLAINT, 
        SUGGESTION, 
        COMPLIMENT, 
        ISSUE, 
        QUESTION 
    }

    public enum Privacy { 
        PUBLIC,     
        PRIVATE,     
        CONFIDENTIAL 
    } 

    public enum FeedbackStatus { 
        PENDING,
        SUBMITTED,  
        REVIEWED,    
        RESPONDED,   
        RESOLVED,  
        ARCHIVED  
    }

    public Feedback() { 
        this.submissionDate = LocalDateTime.now(); 
        this.lastUpdated = LocalDateTime.now(); 
        this.status = FeedbackStatus.SUBMITTED; 
        this.privacy = Privacy.PRIVATE; 
    }

    public String getId() {
         return id; 
    }
    public void setId(String id) { 
        this.id = id; 
    } 
    public String getUserId() { 
        return userId; 
    } 
    public void setUserId(String userId) { 
        this.userId = userId; 
    } 
    public String getCaseId() { 
        return caseId; 
    } 
    public void setCaseId(String caseId) { 
        this.caseId = caseId; 
    } 
    public String getHelpRequestId() { 
        return helpRequestId; 
    } 
    public void setHelpRequestId(String helpRequestId) { 
        this.helpRequestId = helpRequestId; 
    } 
    public String getServiceOfferId() { 
        return serviceOfferId; 
    } 
    public void setServiceOfferId(String serviceOfferId) { 
        this.serviceOfferId = serviceOfferId; 
    } 
    public FeedbackType getFeedbackType() { 
        return feedbackType; 
    } 
    public void setFeedbackType(FeedbackType feedbackType) { 
        this.feedbackType = feedbackType; 
    } 
    public String getFeedbackText() { 
        return feedbackText; 
    } 
    public void setFeedbackText(String feedbackText) { 
        this.feedbackText = feedbackText; 
    } 
    public Integer getRating() { 
        return rating; 
    } 
    public void setRating(Integer rating) { 
        this.rating = rating; 
    } 
    public Category getCategory() { 
        return category; 
    } 
    public void setCategory(Category category) { 
        this.category = category; 
    } 
    public Privacy getPrivacy() { 
        return privacy; 
    } 
    public void setPrivacy(Privacy privacy) { 
        this.privacy = privacy; 
    } 
    public FeedbackStatus getStatus() { 
        return status; 
    } 
    public void setStatus(FeedbackStatus status) { 
        this.status = status; 
    } 
    public boolean isAnonymous() { 
        return anonymous; 
    } 
    public void setAnonymous(boolean anonymous) { 
        this.anonymous = anonymous; 
    } 
    public String getAdminResponse() { 
        return adminResponse; 
    } 
    public void setAdminResponse(String adminResponse) { 
        this.adminResponse = adminResponse; 
    } 
    public String getRespondedBy() { 
        return respondedBy; 
    } 
    public void setRespondedBy(String respondedBy) { 
        this.respondedBy = respondedBy; 
    } 
    public LocalDateTime getResponseDate() { 
        return responseDate; 
    } 
    public void setResponseDate(LocalDateTime responseDate) { 
        this.responseDate = responseDate; 
    } 
    public LocalDateTime getSubmissionDate() { 
        return submissionDate; 
    } 
    public void setSubmissionDate(LocalDateTime submissionDate) { 
        this.submissionDate = submissionDate; 
    } 
    public LocalDateTime getLastUpdated() { 
        return lastUpdated; 
    } 
    public void setLastUpdated(LocalDateTime lastUpdated) { 
        this.lastUpdated = lastUpdated; 
    }
}
