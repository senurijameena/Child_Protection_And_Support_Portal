package com.example.childPortal.dto;

public class ServiceResponseDTO {
    private String offerId;
    private boolean accepted;
    private String responseMessage;
    private String userId;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getOfferId() { return offerId; }
    public void setOfferId(String offerId) { this.offerId = offerId; }
    public boolean isAccepted() { return accepted; }
    public void setAccepted(boolean accepted) { this.accepted = accepted; }
    public String getResponseMessage() { return responseMessage; }
    public void setResponseMessage(String responseMessage) { this.responseMessage = responseMessage; }
}