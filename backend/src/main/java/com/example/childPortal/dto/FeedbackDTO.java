package com.example.childPortal.dto;

import com.example.childPortal.model.Feedback.FeedbackType; 
import com.example.childPortal.model.Feedback.Category; 
import com.example.childPortal.model.Feedback.Privacy;

public class FeedbackDTO {
    private String feedbackId;
    private String message;
    private boolean success; 

    public FeedbackDTO() {} 

    public FeedbackDTO(String feedbackId, String message, boolean success) { 
        this.feedbackId = feedbackId; 
        this.message = message; 
        this.success = success; 
    } 

    public String getFeedbackId() {
        return feedbackId;
    }
    public void setFeedbackId(String feedbackId) {
        this.feedbackId = feedbackId;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public boolean isSuccess() {
        return success;
    }
    public void setSuccess(boolean success) {
        this.success = success;
    }
}
