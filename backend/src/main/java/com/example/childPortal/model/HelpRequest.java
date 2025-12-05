package com.example.childPortal.model; 
import org.springframework.data.annotation.Id; 
import org.springframework.data.mongodb.core.mapping.Document; 
import java.time.LocalDateTime; 
import java.util.List; 

@Document(collection = "help_requests") 
public class HelpRequest { 
    @Id 
    private String id; 
    private String requesterUserId; 
    private boolean anonymous; 
    
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
    private LocalDateTime requestDate; 
    private LocalDateTime lastUpdated; 

    private Priority priority;
    private boolean emergency;
    private String assignedAdminId;
    private String rejectionReason;
    private LocalDateTime approvalDate;
    private LocalDateTime rejectionDate;
     
    public enum ContactMethod { 
        EMAIL, 
        PHONE, 
        WHATSAPP, 
        IN_PERSON 
    } 
     
    public enum RequestStatus { 
        REQUESTED, 
        UNDER_REVIEW, 
        ASSIGNED_TO_WORKER, 
        IN_PROGRESS, 
        COMPLETED, 
        REJECTED 
    } 
 
    public HelpRequest() { 
        this.requestDate = LocalDateTime.now(); 
        this.lastUpdated = LocalDateTime.now(); 
        this.status = RequestStatus.REQUESTED; 
    } 
    
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
    public String getApproximateAge() { 
        return approximateAge; 
    } 

    public void setApproximateAge(String approximateAge) { 
        this.approximateAge = approximateAge; 
    } 

    public String getGender() { 
        return gender; 
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
    public Priority getPriority() {
        return priority; }

    public void setPriority(Priority priority) { 
        this.priority = priority; }    

    public boolean isEmergency() { 
        return emergency; }

    public void setEmergency(boolean emergency) { 
        this.emergency = emergency; }

    public String getAssignedAdminId() { 
        return assignedAdminId; }
    
    public void setAssignedAdminId(String assignedAdminId) { 
        this.assignedAdminId = assignedAdminId; }

    public String getRejectionReason() { 
        return rejectionReason; }
        
    public void setRejectionReason(String rejectionReason) { 
        this.rejectionReason = rejectionReason; }

    public LocalDateTime getApprovalDate() { 
        return approvalDate; }

    public void setApprovalDate(LocalDateTime approvalDate) { 
        this.approvalDate = approvalDate; }

    public LocalDateTime getRejectionDate() { 
        return rejectionDate; }

    public void setRejectionDate(LocalDateTime rejectionDate) { 
        this.rejectionDate = rejectionDate; }

    }