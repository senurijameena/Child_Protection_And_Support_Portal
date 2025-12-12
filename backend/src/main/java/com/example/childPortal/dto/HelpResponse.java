package com.example.childPortal.dto;

public class HelpResponse {
    private String helpRequestId;
    private String message;
    private boolean success;

    public HelpResponse() {}
    public HelpResponse(String helpRequestId, String message, boolean success) {
        this.helpRequestId = helpRequestId;
        this.message = message;
        this.success = success;
    }

    // Getters and setters
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
}