package com.example.childPortal.dto; 
import com.example.childPortal.model.HelpType; 
import com.example.childPortal.model.HelpRequest.ContactMethod; 
import com.example.childPortal.model.HelpRequest.RequestStatus; 
import java.time.LocalDateTime; 
import java.util.List; 

public class HelpRequestDTO { 
    private String id; 
    private String requesterUserId; 
    private boolean anonymous; 
    private String requesterName; 
    private String approximateAge; 
    private String gender; 
    private String identificationMarks; 
    private HelpType helpType; 
    private String description; 
    private String location; 
    private ContactMethod preferredContactMethod; 
    private String contactDetails; 
    private List<String> documentUrls; 
    private RequestStatus status; 
    private String assignedWorkerId; 
    private String assignedWorkerName; 
    private LocalDateTime requestDate; 
    private LocalDateTime lastUpdated; 
    public HelpRequestDTO() {} 
 

    public String getId() { 
        return id; 
    } 
    public void setId(String id) { 
        this.id = id; 
    } 
    public String getRequesterUserId() { 
        return requesterUserId; 
    } 
    public void setRequesterUserId(String requesterUserId) { 
        this.requesterUserId = requesterUserId; 
    } 
    public boolean isAnonymous() { 
        return anonymous; 
    }
    public void setAnonymous(boolean anonymous) { 
        this.anonymous = anonymous; 
    }
    public String getRequesterName() { 
        return requesterName; 
    }
    public void setRequesterName(String requesterName) { 
        this.requesterName = requesterName; 
    }
    public String getApproximateAge() { 
        return approximateAge; 
    }
    public void setApproximateAge(String approximateAge) { 
        this.approximateAge = approximateAge; 
    }
    public String getGender() { 
        return  gender; 
    }
    public void setGender(String gender) { 
        this.gender = gender; 
    } 
    public String getIdentificationMarks() {   
    return identificationMarks; 
    } 
    public void setIdentificationMarks(String identificationMarks) { 
        this.identificationMarks = identificationMarks; 
    } 
    public HelpType getHelpType() { 
        return helpType; 
    } 
    public void setHelpType(HelpType helpType) { 
        this.helpType = helpType; 
    } 
    public String getDescription() { 
        return description; 
    } 
    public void setDescription(String description) { 
        this.description = description; 
    } 
    public String getLocation() { 
        return location; 
    } 
    public void setLocation(String location) { 
        this.location = location; 
    } 
    public ContactMethod getPreferredContactMethod() { 
        return preferredContactMethod; 
    } 
    public void setPreferredContactMethod(ContactMethod preferredContactMethod) { 
        this.preferredContactMethod = preferredContactMethod; 
    } 
    public String getContactDetails() { 
        return contactDetails; 
    } 
    public void setContactDetails(String contactDetails) { 
        this.contactDetails = contactDetails; 
    } 
    public List<String> getDocumentUrls() { 
        return documentUrls; 
    } 
    public void setDocumentUrls(List<String> documentUrls) { 
        this.documentUrls = documentUrls; 
    } 
    public RequestStatus getStatus() { 
        return status; 
    } 
    public void setStatus(RequestStatus status) { 
        this.status = status; 
    } 
    public String getAssignedWorkerId() { 
        return assignedWorkerId; 
    } 
    public void setAssignedWorkerId(String assignedWorkerId) { 
        this.assignedWorkerId = assignedWorkerId; 
    } 
    public String getAssignedWorkerName() { 
        return assignedWorkerName; 
    } 
    public void setAssignedWorkerName(String assignedWorkerName) { 
        this.assignedWorkerName = assignedWorkerName; 
    } 
    public LocalDateTime getRequestDate() { 
        return requestDate; 
    } 
    public void setRequestDate(LocalDateTime requestDate) { 
        this.requestDate = requestDate; 
    } 
    public LocalDateTime getLastUpdated() { 
        return lastUpdated; 
    } 
    public void setLastUpdated(LocalDateTime lastUpdated) { 
        this.lastUpdated = lastUpdated; 
    } 
}
