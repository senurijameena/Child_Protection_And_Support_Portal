package com.example.childPortal.model;

import org.springframework.data.annotation.Id; 
import org.springframework.data.mongodb.core.mapping.Document; 
import java.time.LocalDateTime;

@Document(collection = "service_responses")
public class ServiceResponse {
    @Id 
    private String id; 
    private String serviceOfferId; 
    private String userId;

    private ServiceOffer.ResponseAction action; 
    private String responseMessage; 

    private LocalDateTime proposedDateTime; 
    private String rescheduleReason;

    private String requestedInfo;
    private boolean processed; 
    private String processedBy; 
    private LocalDateTime processedDate; 
    private String processingNotes;

    public ServiceResponse() {}

    public String getId() { 
        return id; 
    }
    public void setId(String id) { 
        this.id = id; 
    }
    public String getServiceOfferId() { 
        return serviceOfferId; 
    }
    public void setServiceOfferId(String serviceOfferId) { 
        this.serviceOfferId = serviceOfferId; 
    }
    public String getUserId() { 
        return userId; 
    }
    public void setUserId(String userId) { 
        this.userId = userId; 
    }
    public ServiceOffer.ResponseAction getAction() { 
        return action; 
    }
    public void setAction(ServiceOffer.ResponseAction action) { 
        this.action = action; 
    }
    public String getResponseMessage() { 
        return responseMessage; 
    }
    public void setResponseMessage(String responseMessage) { 
        this.responseMessage = responseMessage; 
    }
    public LocalDateTime getProposedDateTime() { 
        return proposedDateTime; 
    }
    public void setProposedDateTime(LocalDateTime proposedDateTime) { 
        this.proposedDateTime = proposedDateTime; 
    }
    public String getRescheduleReason() { 
        return rescheduleReason; 
    }
    public void setRescheduleReason(String rescheduleReason) { 
        this.rescheduleReason = rescheduleReason; 
    }
    public String getRequestedInfo() { 
        return requestedInfo; 
    }
    public void setRequestedInfo(String requestedInfo) { 
        this.requestedInfo = requestedInfo; 
    }
    public boolean isProcessed() { 
        return processed; 
    }
    public void setProcessed(boolean processed) { 
        this.processed = processed; 
    }
    public String getProcessedBy() { 
        return processedBy; 
    }
    public void setProcessedBy(String processedBy) { 
        this.processedBy = processedBy; 
    }
    public LocalDateTime getProcessedDate() { 
        return processedDate; 
    }
    public void setProcessedDate(LocalDateTime processedDate) { 
        this.processedDate = processedDate; 
    }
    public String getProcessingNotes() { 
        return processingNotes; 
    }
    public void setProcessingNotes(String processingNotes) { 
        this.processingNotes = processingNotes; 
    }
}
