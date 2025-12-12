package com.example.childPortal.dto;

import com.example.childPortal.model.HelpType; 
import com.example.childPortal.model.ServiceOffer.OfferStatus; 
import com.example.childPortal.model.ServiceOffer.ResponseAction; 
import java.time.LocalDateTime;

public class ServiceOfferDTO {
    private String id; 
    private String helpRequestId;
    private String offeredByUserId; 
    private String offeredToUserId;
    private String offeredByName;
    private String offeredToName;

    private HelpType serviceType; 
    private String providerName;
    private String providerLocation;
    private String serviceDetails; 

    private LocalDateTime scheduledDateTime;
    private LocalDateTime endDateTime;
    private String duration; 

    private OfferStatus status;
    private ResponseAction userAction;
    private LocalDateTime responseDate;

    private String notes; 
    private boolean requiresFollowUp;
    private LocalDateTime followUpDate; 

    private LocalDateTime offerDate;
    private LocalDateTime lastUpdated; 

    private boolean isPendingResponse; 
    private boolean isUpcoming; 
    private boolean isCompleted; 
    private boolean canRespond; 

    public ServiceOfferDTO() {} 

    public String getId() { 
        return id; 
    } 
    public void setId(String id) { 
        this.id = id; 
    }
    public String getHelpRequestId() { 
        return helpRequestId; 
    }
    public void setHelpRequestId(String helpRequestId) { 
        this.helpRequestId = helpRequestId; 
    }
    public String getOfferedByUserId() { 
        return offeredByUserId; 
    }
    public void setOfferedByUserId(String offeredByUserId) { 
        this.offeredByUserId = offeredByUserId;
    }
    public String getOfferedToUserId() { 
        return offeredToUserId; 
    }
    public void setOfferedToUserId(String offeredToUserId) { 
        this.offeredToUserId = offeredToUserId; 
    }
    public String getOfferedByName() {
        return offeredByName;
    }
    public void setOfferedByName(String offeredByName) {
        this.offeredByName = offeredByName;
    }
    public String getOfferedToName() {
        return offeredToName;
    }
    public void setOfferedToName(String offeredToName) {
        this.offeredToName = offeredToName;
    }
    public HelpType getServiceType() { 
        return serviceType; 
    }
    public void setServiceType(HelpType serviceType) { 
        this.serviceType = serviceType; 
    }
    public String getProviderName() { 
        return providerName; 
    }
    public void setProviderName(String providerName) { 
        this.providerName = providerName; 
    }
    public String getProviderLocation() { 
        return providerLocation; 
    }
    public void setProviderLocation(String providerLocation) { 
        this.providerLocation = providerLocation; 
    }
    public String getServiceDetails() { 
        return serviceDetails; 
    }
    public void setServiceDetails(String serviceDetails) { 
        this.serviceDetails = serviceDetails; 
    }
    public LocalDateTime getScheduledDateTime() { 
        return scheduledDateTime; 
    }
    public void setScheduledDateTime(LocalDateTime scheduledDateTime) { 
        this.scheduledDateTime = scheduledDateTime; 
    }
    public LocalDateTime getEndDateTime() { 
        return endDateTime; 
    }
    public void setEndDateTime(LocalDateTime endDateTime) { 
        this.endDateTime = endDateTime; 
    }
    public String getDuration() { 
        return duration; 
    }
    public void setDuration(String duration) { 
        this.duration = duration; 
    }
    public OfferStatus getStatus() { 
        return status; 
    }
    public void setStatus(OfferStatus status) { 
        this.status = status; 
    }
    public ResponseAction getUserAction() { 
        return userAction; 
    }
    public void setUserAction(ResponseAction userAction) { 
        this.userAction = userAction; 
    }
    public LocalDateTime getResponseDate() { 
        return responseDate; 
    }
    public void setResponseDate(LocalDateTime responseDate) { 
        this.responseDate = responseDate; 
    }
    public String getNotes() { 
        return notes; 
    }
    public void setNotes(String notes) { 
        this.notes = notes; 
    }
    public boolean isRequiresFollowUp() { 
        return requiresFollowUp; 
    }
    public void setRequiresFollowUp(boolean requiresFollowUp) { 
        this.requiresFollowUp = requiresFollowUp; 
    }
    public LocalDateTime getFollowUpDate() { 
        return followUpDate; 
    }
    public void setFollowUpDate(LocalDateTime followUpDate) { 
        this.followUpDate = followUpDate; 
    }
    public LocalDateTime getOfferDate() { 
        return offerDate; 
    }
    public void setOfferDate(LocalDateTime offerDate) { 
        this.offerDate = offerDate; 
    }
    public LocalDateTime getLastUpdated() { 
        return lastUpdated; 
    }
    public void setLastUpdated(LocalDateTime lastUpdated) { 
        this.lastUpdated = lastUpdated; 
    }
    public boolean isPendingResponse() { 
        return isPendingResponse; 
    }
    public void setPendingResponse(boolean pendingResponse) { 
        isPendingResponse = pendingResponse; 
    }
    public boolean isUpcoming() { 
        return isUpcoming; 
    }
    public void setUpcoming(boolean upcoming) { 
        isUpcoming = upcoming; 
    }
    public boolean isCompleted() { 
        return isCompleted; 
    }    
    public void setCompleted(boolean completed) { 
        isCompleted = completed; 
    }
    public boolean isCanRespond() { 
        return canRespond; 
    }
    public void setCanRespond(boolean canRespond) { 
        this.canRespond = canRespond; 
    }
}
