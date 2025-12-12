package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "help_requests")
public class HelpRequest {
    @Id
    private String id;
    private String trackingId;
    private String requesterUserId;
    private boolean anonymous;
    private String requesterName;
    
    // Child details
    private String approximateAge;
    private String gender;
    
    // Request details
    private HelpType helpType;
    private String description;
    private String location;
    private List<String> documentUrls;
    
    // Status and assignment
    private RequestStatus status;
    private String assignedWorkerId;
    private Priority priority;
    
    // Timestamps
    private LocalDateTime requestDate;
    private LocalDateTime lastUpdated;
    private LocalDateTime completionDate;
    
    // Simple notes field
    private String requestNotes;
    
    public enum RequestStatus {
        REQUESTED,
        UNDER_REVIEW,
        ASSIGNED,
        IN_PROGRESS,
        COMPLETED,
        REJECTED
    }

    public HelpRequest() {
        this.requestDate = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
        this.status = RequestStatus.REQUESTED;
        this.priority = Priority.MEDIUM;
    }

    // Generate tracking ID
    public String generateTrackingId() {
        if (this.id != null && this.id.length() >= 4) {
            return "HR-" + this.id.substring(0, 4).toUpperCase();
        }
        return "HR-" + this.id;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTrackingId() { 
        if (trackingId == null) {
            return generateTrackingId();
        }
        return trackingId; 
    }
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
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    public LocalDateTime getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDateTime completionDate) { this.completionDate = completionDate; }
    public String getRequestNotes() { return requestNotes; }
    public void setRequestNotes(String requestNotes) { this.requestNotes = requestNotes; }
}