package com.example.childPortal.dto;

public class CaseResponse {
    private String caseId;
    private String trackingId;
    private String message;
    private boolean success;

    public CaseResponse() {
    }

    public CaseResponse(String caseId, String message, boolean success) {
        this.caseId = caseId;
        this.message = message;
        this.success = success;
    }

    public CaseResponse(String caseId, String trackingId, String message, boolean success) {
        this.caseId = caseId;
        this.trackingId = trackingId;
        this.message = message;
        this.success = success;
    }

    public String getCaseId() {
        return caseId;
    }

    public void setCaseId(String caseId) {
        this.caseId = caseId;
    }

    public String getTrackingId() {
        return trackingId;
    }

    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
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
