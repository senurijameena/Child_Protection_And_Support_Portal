package com.example.childPortal.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ResourceAssignmentDTO {
    private String id;
    private String helpRequestId;
    private String serviceItem;
    private int serviceItemIndex;
    
    // Resource details
    private String resourceName;
    private String resourceOrganization;
    private String resourceContactPerson;
    private String resourcePhone;
    private String resourceEmail;
    private String resourceAddress;
    
    // Scheduling
    private LocalDate scheduledDate;
    private String scheduledTime; // String format for easier frontend handling (HH:mm)
    private int estimatedDurationMinutes;
    private String location;
    
    // Status
    private String status;
    private String confirmationStatus;
    
    // Notes
    private String assignmentNotes;
    private String specialInstructions;
    
    public ResourceAssignmentDTO() {}
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    
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
    
    public String getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(String scheduledTime) { this.scheduledTime = scheduledTime; }
    
    public int getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public void setEstimatedDurationMinutes(int estimatedDurationMinutes) { this.estimatedDurationMinutes = estimatedDurationMinutes; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getConfirmationStatus() { return confirmationStatus; }
    public void setConfirmationStatus(String confirmationStatus) { this.confirmationStatus = confirmationStatus; }
    
    public String getAssignmentNotes() { return assignmentNotes; }
    public void setAssignmentNotes(String assignmentNotes) { this.assignmentNotes = assignmentNotes; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
}
