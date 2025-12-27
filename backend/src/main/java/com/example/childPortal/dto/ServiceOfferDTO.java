package com.example.childPortal.dto;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.ServiceOffer.OfferStatus;
import java.time.LocalDateTime;

public class ServiceOfferDTO {
    private String id;
    private String helpRequestId;
    private String offeredByUserId;
    private String offeredToUserId;
    private HelpType serviceType;
    private String serviceDetails;
    private LocalDateTime scheduledDateTime;
    private OfferStatus status;
    private LocalDateTime offerDate;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    public String getOfferedByUserId() { return offeredByUserId; }
    public void setOfferedByUserId(String offeredByUserId) { this.offeredByUserId = offeredByUserId; }
    public String getOfferedToUserId() { return offeredToUserId; }
    public void setOfferedToUserId(String offeredToUserId) { this.offeredToUserId = offeredToUserId; }
    public HelpType getServiceType() { return serviceType; }
    public void setServiceType(HelpType serviceType) { this.serviceType = serviceType; }
    public String getServiceDetails() { return serviceDetails; }
    public void setServiceDetails(String serviceDetails) { this.serviceDetails = serviceDetails; }
    public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
    public void setScheduledDateTime(LocalDateTime scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }
    public OfferStatus getStatus() { return status; }
    public void setStatus(OfferStatus status) { this.status = status; }
    public LocalDateTime getOfferDate() { return offerDate; }
    public void setOfferDate(LocalDateTime offerDate) { this.offerDate = offerDate; }
}
