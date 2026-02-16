package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "follow_ups")
public class FollowUp {
    @Id
    private String id;
    private String socialWorkerId;
    private String helpRequestId; // Optional link to a request
    private String childName;
    private String type; // Home Visit, Phone Call, etc.
    private String status; // UPCOMING, CONFIRMED, URGENT, SCHEDULED, COMPLETED, MISSED
    private String priority; // HIGH, MEDIUM, LOW
    private LocalDateTime scheduledDate;
    private String notes;
    private String missedReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FollowUp() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "UPCOMING";
        this.priority = "MEDIUM";
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSocialWorkerId() {
        return socialWorkerId;
    }

    public void setSocialWorkerId(String socialWorkerId) {
        this.socialWorkerId = socialWorkerId;
    }

    public String getHelpRequestId() {
        return helpRequestId;
    }

    public void setHelpRequestId(String helpRequestId) {
        this.helpRequestId = helpRequestId;
    }

    public String getChildName() {
        return childName;
    }

    public void setChildName(String childName) {
        this.childName = childName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
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

    public String getMissedReason() {
        return missedReason;
    }

    public void setMissedReason(String missedReason) {
        this.missedReason = missedReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
