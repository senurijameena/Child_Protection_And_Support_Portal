package com.example.childPortal.dto;

public class SendMessageRequest {
    private String toUserId;
    private String message;
    private String relatedCaseId;
    private String relatedRequestId;

    public String getToUserId() { return toUserId; }
    public void setToUserId(String toUserId) { this.toUserId = toUserId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getRelatedCaseId() { return relatedCaseId; }
    public void setRelatedCaseId(String relatedCaseId) { this.relatedCaseId = relatedCaseId; }
    public String getRelatedRequestId() { return relatedRequestId; }
    public void setRelatedRequestId(String relatedRequestId) { this.relatedRequestId = relatedRequestId; }
}

