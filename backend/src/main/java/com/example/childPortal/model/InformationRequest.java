package com.example.childPortal.model; 

import org.springframework.data.annotation.Id; 
import org.springframework.data.mongodb.core.mapping.Document; 
import java.time.LocalDateTime; 
import java.util.List; 

@Document(collection = "information_requests") 
public class InformationRequest { 
@Id 
private String id; 
private String caseId; 
private String helpRequestId; 
private String requestedByUserId;
private String requestedFromUserId;  
 
private String title; 
private String description; 
private List<String> informationNeeded; 
private Priority priority; 
private RequestStatus status; 
     

    private LocalDateTime dateRequested; 
    private LocalDateTime dueDate; 
    private LocalDateTime responseDate; 

    private String userResponse; 
    private List<String> responseDocuments;
     

    private boolean extensionRequested; 
    private String extensionReason; 
    private LocalDateTime newDueDate; 
     
    public enum Priority { 
        NORMAL, 
        URGENT, 
        CRITICAL 
    } 
     
    public enum RequestStatus { 
        PENDING,        
        RESPONDED,    
        OVERDUE,        
        EXTENDED,      
        CLOSED         
    }
    
    public InformationRequest() { 
        this.dateRequested = LocalDateTime.now(); 
        this.status = RequestStatus.PENDING; 
        this.priority = Priority.NORMAL; 
    } 
    
    public String getId() { 
        return id; 
    }
    public void setId(String id) { 
        this.id = id; 
    }
    public String getCaseId() { 
        return caseId; 
    }
    public void setCaseId(String caseId) { 
        this.caseId = caseId; 
    }
    public String getHelpRequestId() { 
        return helpRequestId; 
    }
    public void setHelpRequestId(String helpRequestId) { 
        this.helpRequestId = helpRequestId; 
    }
    public String getRequestedByUserId() { 
        return requestedByUserId; 
    }
    public void setRequestedByUserId(String requestedByUserId) { 
        this.requestedByUserId = requestedByUserId; 
    }
    public String getRequestedFromUserId() { 
        return requestedFromUserId; 
    }
    public void setRequestedFromUserId(String requestedFromUserId) { 
        this.requestedFromUserId = requestedFromUserId; 
    }
    public String getTitle() { 
        return title; 
    }
    public void setTitle(String title) { 
        this.title = title; 
    }
    public String getDescription() { 
        return description; 
    }
    public void setDescription(String description) { 
        this.description = description; 
    }
    public List<String> getInformationNeeded() { 
        return informationNeeded; 
    }
    public void setInformationNeeded(List<String> informationNeeded) { 
        this.informationNeeded = informationNeeded; 
    }
    public Priority getPriority() { 
        return priority; 
    }
    public void setPriority(Priority priority) { 
        this.priority = priority; 
    }
    public RequestStatus getStatus() { 
        return status; 
    }
    public void setStatus(RequestStatus status) { 
        this.status = status; 
    }
    public LocalDateTime getDateRequested() { 
        return dateRequested; 
    }
    public void setDateRequested(LocalDateTime dateRequested) { 
        this.dateRequested = dateRequested; 
    }
    public LocalDateTime getDueDate() { 
        return dueDate; 
    }
    public void setDueDate(LocalDateTime dueDate) { 
        this.dueDate = dueDate; 
    }
    public LocalDateTime getResponseDate() { 
        return responseDate; 
    }
    public void setResponseDate(LocalDateTime responseDate) { 
        this.responseDate = responseDate; 
    }
    public String getUserResponse() { 
        return userResponse; 
    }
    public void setUserResponse(String userResponse) { 
        this.userResponse = userResponse; 
    }
    public List<String> getResponseDocuments() { 
        return responseDocuments; 
    }
    public void setResponseDocuments(List<String> responseDocuments) { 
        this.responseDocuments = responseDocuments; 
    }
    public boolean isExtensionRequested() { 
        return extensionRequested; 
    }
    public void setExtensionRequested(boolean extensionRequested) { 
        this.extensionRequested = extensionRequested; 
    }
    public String getExtensionReason() { 
        return extensionReason; 
    }
    public void setExtensionReason(String extensionReason) { 
        this.extensionReason = extensionReason; 
    }
    public LocalDateTime getNewDueDate() { 
        return newDueDate; 
    }
    public void setNewDueDate(LocalDateTime newDueDate) { 
        this.newDueDate = newDueDate; 
    }
    
}