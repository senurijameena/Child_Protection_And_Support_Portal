package com.example.childPortal.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class ServiceItemExecutionDTO {
    private String serviceItem;
    private String status; // PENDING, IN_PROGRESS, SCHEDULED, COMPLETED
    private String assignedResource;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime scheduledDate;
    private String notes;

    public ServiceItemExecutionDTO() {
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
