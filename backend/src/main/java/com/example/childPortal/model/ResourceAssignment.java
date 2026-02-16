package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "resource_assignments")
public class ResourceAssignment {
    @Id
    private String id;
    private String helpRequestId;
    private String socialWorkerId;
    
    // Service item details
    private String serviceItem;
    private int serviceItemIndex; // Index in the appliedPackageItemExecutions list
    
    // Resource details
    private String resourceName;
    private String resourceOrganization;
    private String resourceContactPerson;
    private String resourcePhone;
    private String resourceEmail;
    private String resourceAddress;
    
    // Scheduling
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private int estimatedDurationMinutes;
    private String location; // Where the service will be delivered
    
    // Status tracking
    private String status; // SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED
    private String confirmationStatus; // PENDING, CONFIRMED, DECLINED
    private LocalDateTime confirmedAt;
    
    // Follow-up integration
    private String followUpId; // Link to auto-created follow-up
    private boolean addedToCalendar;
    private boolean reminderCreated;
    
    // Notes
    private String assignmentNotes;
    private String specialInstructions;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    
    public ResourceAssignment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "SCHEDULED";
        this.confirmationStatus = "PENDING";
        this.addedToCalendar = false;
        this.reminderCreated = false;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    
    public String getSocialWorkerId() { return socialWorkerId; }
    public void setSocialWorkerId(String socialWorkerId) { this.socialWorkerId = socialWorkerId; }
    
    public String getServiceItem() { return serviceItem; }
    public void setServiceItem(String serviceItem) { this.serviceItem = serviceItem; }
    
    public int getServiceItemIndex() { return serviceItemIndex; }
    public void setServiceItemIndex(int serviceItemIndex) { this.serviceItemIndex = serviceItemIndex; }
    
    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    
    public String getResourceOrganization() { return resourceOrganization; }
    public void setResourceOrganization(String resourceOrganization) { this.resourceOrganization = resourceOrganization; }
    
    public String getResourceContactPerson() { return resourceContactPerson; }
    public void setResourceContactPerson(String resourceContactPerson) { this.resourceContactPerson = resourceContactPerson; }
    
    public String getResourcePhone() { return resourcePhone; }
    public void setResourcePhone(String resourcePhone) { this.resourcePhone = resourcePhone; }
    
    public String getResourceEmail() { return resourceEmail; }
    public void setResourceEmail(String resourceEmail) { this.resourceEmail = resourceEmail; }
    
    public String getResourceAddress() { return resourceAddress; }
    public void setResourceAddress(String resourceAddress) { this.resourceAddress = resourceAddress; }
    
    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }
    
    public LocalTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalTime scheduledTime) { this.scheduledTime = scheduledTime; }
    
    public int getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public void setEstimatedDurationMinutes(int estimatedDurationMinutes) { this.estimatedDurationMinutes = estimatedDurationMinutes; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getConfirmationStatus() { return confirmationStatus; }
    public void setConfirmationStatus(String confirmationStatus) { this.confirmationStatus = confirmationStatus; }
    
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    
    public String getFollowUpId() { return followUpId; }
    public void setFollowUpId(String followUpId) { this.followUpId = followUpId; }
    
    public boolean isAddedToCalendar() { return addedToCalendar; }
    public void setAddedToCalendar(boolean addedToCalendar) { this.addedToCalendar = addedToCalendar; }
    
    public boolean isReminderCreated() { return reminderCreated; }
    public void setReminderCreated(boolean reminderCreated) { this.reminderCreated = reminderCreated; }
    
    public String getAssignmentNotes() { return assignmentNotes; }
    public void setAssignmentNotes(String assignmentNotes) { this.assignmentNotes = assignmentNotes; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
