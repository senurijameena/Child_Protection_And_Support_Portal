package com.example.childPortal.dto;

import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.model.Priority;
import java.time.LocalDateTime;
import java.util.List;

public class HelpRequestDTO {
    private String id;
    private String trackingId;
    private String requesterUserId;
    private boolean anonymous;
    private String requesterName;
    private String approximateAge;
    private String gender;
    private String identificationMarks; // Add this field
    private HelpType helpType;
    private String description;
    private String location;
    private List<String> documentUrls;
    private RequestStatus status;
    private String assignedWorkerId;
    private LocalDateTime requestDate;
    private Priority priority; // Add this field
    
    public HelpRequestDTO() {}

    // Getters and setters for ALL fields
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
    
    public String getRequesterUserId() { return requesterUserId; }
    public void setRequesterUserId(String requesterUserId) { this.requesterUserId = requesterUserId; }
    
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
    
    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
    
    public String getApproximateAge() { return approximateAge; }
    public void setApproximateAge(String approximateAge) { this.approximateAge = approximateAge; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    // ADD THIS GETTER AND SETTER:
    public String getIdentificationMarks() { return identificationMarks; }
    public void setIdentificationMarks(String identificationMarks) { this.identificationMarks = identificationMarks; }
    
    public HelpType getHelpType() { return helpType; }
    public void setHelpType(HelpType helpType) { this.helpType = helpType; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public List<String> getDocumentUrls() { return documentUrls; }
    public void setDocumentUrls(List<String> documentUrls) { this.documentUrls = documentUrls; }
    
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    
    public String getAssignedWorkerId() { return assignedWorkerId; }
    public void setAssignedWorkerId(String assignedWorkerId) { this.assignedWorkerId = assignedWorkerId; }
    
    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
    
    // ADD THESE FOR PRIORITY:
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
}
