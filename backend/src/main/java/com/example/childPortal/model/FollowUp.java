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
    private String title; // Short title for this follow-up (e.g. "Home visit – Week 1")
    private String serviceItem; // Linked checklist/service task for this follow-up
    private LocalDateTime scheduledDate;
    private LocalDateTime nextScheduledDate; // New date when missed/rescheduled
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getServiceItem() {
        return serviceItem;
    }

    public void setServiceItem(String serviceItem) {
        this.serviceItem = serviceItem;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDateTime getNextScheduledDate() {
        return nextScheduledDate;
    }

    public void setNextScheduledDate(LocalDateTime nextScheduledDate) {
        this.nextScheduledDate = nextScheduledDate;
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
