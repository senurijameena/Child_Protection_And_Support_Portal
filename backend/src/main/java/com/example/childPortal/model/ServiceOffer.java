package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "service_offers")
public class ServiceOffer {
    @Id
    private String id;
    private String helpRequestId;
    private String offeredByUserId; // social worker ID
    private String offeredToUserId; // requester ID
    private LocalDateTime scheduledDateTime;
    private HelpType serviceType;
    private String serviceDetails;
    private OfferStatus status;
    
    private LocalDateTime offerDate;
    private LocalDateTime responseDate;

    public enum OfferStatus {
        PENDING,
        ACCEPTED,
        REJECTED,
        COMPLETED,
        CANCELLED
    }

    public ServiceOffer() {
        this.offerDate = LocalDateTime.now();
        this.status = OfferStatus.PENDING;
    }

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
    public OfferStatus getStatus() { return status; }
    public void setStatus(OfferStatus status) { this.status = status; }
    public LocalDateTime getOfferDate() { return offerDate; }
    public void setOfferDate(LocalDateTime offerDate) { this.offerDate = offerDate; }
    public LocalDateTime getResponseDate() { return responseDate; }
    public void setResponseDate(LocalDateTime responseDate) { this.responseDate = responseDate; }
    public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
    public void setScheduledDateTime(LocalDateTime scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }
}