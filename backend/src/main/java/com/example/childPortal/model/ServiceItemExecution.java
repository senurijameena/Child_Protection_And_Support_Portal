package com.example.childPortal.model;

import java.time.LocalDateTime;

public class ServiceItemExecution {
    private String serviceItem;
    private String status; 
    private String assignedResource;
    private LocalDateTime scheduledDate;
    private String notes;

    public ServiceItemExecution() {
    }

    public ServiceItemExecution(String serviceItem, String status) {
        this.serviceItem = serviceItem;
        this.status = status != null ? status : "PENDING";
    }

    public String getServiceItem() {
        return serviceItem;
    }

    public void setServiceItem(String serviceItem) {
        this.serviceItem = serviceItem;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedResource() {
        return assignedResource;
    }

    public void setAssignedResource(String assignedResource) {
        this.assignedResource = assignedResource;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
