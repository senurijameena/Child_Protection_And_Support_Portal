package com.example.childPortal.dto;
import java.time.LocalDateTime;

public class ServiceResponseDTO {
    private String offerId;
    private boolean accepted;
    private String responseMessage;

    // Getters and setters
    public String getOfferId() { return offerId; }
    public void setOfferId(String offerId) { this.offerId = offerId; }
    public boolean isAccepted() { return accepted; }
    public void setAccepted(boolean accepted) { this.accepted = accepted; }
    public String getResponseMessage() { return responseMessage; }
    public void setResponseMessage(String responseMessage) { this.responseMessage = responseMessage; }
}