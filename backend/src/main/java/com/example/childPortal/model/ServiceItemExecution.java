package com.example.childPortal.model;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class ServiceItemExecution {
    private String serviceItem;
    private String status; // PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, PARTIALLY_COMPLETED, NOT_DELIVERED, RESCHEDULED
    private String assignedResource;
    private String resourceOrganization; // NGO/Organization name
    private LocalDateTime scheduledDate;
    private LocalTime scheduledTime;
    private String notes;
    
    // Outcome tracking
    private String outcome; // COMPLETED_SUCCESSFULLY, PARTIALLY_COMPLETED, NOT_DELIVERED
    private String outcomeReason; // For NOT_DELIVERED: RESOURCE_UNAVAILABLE, USER_UNAVAILABLE, INCORRECT_INFO
    private String outcomeNotes;
    private LocalDateTime outcomeRecordedAt;
    private String outcomeRecordedBy;
    
    // Progress contribution
    private Integer progressContribution; // How much this service contributes to overall progress
    
    // Proof/Evidence
    private List<String> proofUrls;
    private String proofDescription;
    
    // Rescheduling
    private LocalDateTime originalScheduledDate;
    private int rescheduleCount;
    private String lastRescheduleReason;
    
    // Follow-up tracking
    private LocalDateTime nextFollowUpDate;
    private String followUpId; // Reference to FollowUp entity
    
    // Adjustment plan (for partially completed)
    private String adjustmentPlan;
    private boolean adjustmentRequired;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    public ServiceItemExecution() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "PENDING";
        this.rescheduleCount = 0;
    }

    public ServiceItemExecution(String serviceItem, String status) {
        this();
        this.serviceItem = serviceItem;
        this.status = status != null ? status : "PENDING";
    }

    // Original getters and setters
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
        this.updatedAt = LocalDateTime.now();
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

    // New getters and setters
    public String getResourceOrganization() {
        return resourceOrganization;
    }

    public void setResourceOrganization(String resourceOrganization) {
        this.resourceOrganization = resourceOrganization;
    }

    public LocalTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
        this.outcomeRecordedAt = LocalDateTime.now();
    }

    public String getOutcomeReason() {
        return outcomeReason;
    }

    public void setOutcomeReason(String outcomeReason) {
        this.outcomeReason = outcomeReason;
    }

    public String getOutcomeNotes() {
        return outcomeNotes;
    }

    public void setOutcomeNotes(String outcomeNotes) {
        this.outcomeNotes = outcomeNotes;
    }

    public LocalDateTime getOutcomeRecordedAt() {
        return outcomeRecordedAt;
    }

    public void setOutcomeRecordedAt(LocalDateTime outcomeRecordedAt) {
        this.outcomeRecordedAt = outcomeRecordedAt;
    }

    public String getOutcomeRecordedBy() {
        return outcomeRecordedBy;
    }

    public void setOutcomeRecordedBy(String outcomeRecordedBy) {
        this.outcomeRecordedBy = outcomeRecordedBy;
    }

    public Integer getProgressContribution() {
        return progressContribution != null ? progressContribution : 0;
    }

    public void setProgressContribution(Integer progressContribution) {
        this.progressContribution = progressContribution;
    }

    public List<String> getProofUrls() {
        return proofUrls;
    }

    public void setProofUrls(List<String> proofUrls) {
        this.proofUrls = proofUrls;
    }

    public String getProofDescription() {
        return proofDescription;
    }

    public void setProofDescription(String proofDescription) {
        this.proofDescription = proofDescription;
    }

    public LocalDateTime getOriginalScheduledDate() {
        return originalScheduledDate;
    }

    public void setOriginalScheduledDate(LocalDateTime originalScheduledDate) {
        this.originalScheduledDate = originalScheduledDate;
    }

    public int getRescheduleCount() {
        return rescheduleCount;
    }

    public void setRescheduleCount(int rescheduleCount) {
        this.rescheduleCount = rescheduleCount;
    }

    public String getLastRescheduleReason() {
        return lastRescheduleReason;
    }

    public void setLastRescheduleReason(String lastRescheduleReason) {
        this.lastRescheduleReason = lastRescheduleReason;
    }

    public LocalDateTime getNextFollowUpDate() {
        return nextFollowUpDate;
    }

    public void setNextFollowUpDate(LocalDateTime nextFollowUpDate) {
        this.nextFollowUpDate = nextFollowUpDate;
    }

    public String getFollowUpId() {
        return followUpId;
    }

    public void setFollowUpId(String followUpId) {
        this.followUpId = followUpId;
    }

    public String getAdjustmentPlan() {
        return adjustmentPlan;
    }

    public void setAdjustmentPlan(String adjustmentPlan) {
        this.adjustmentPlan = adjustmentPlan;
    }

    public boolean isAdjustmentRequired() {
        return adjustmentRequired;
    }

    public void setAdjustmentRequired(boolean adjustmentRequired) {
        this.adjustmentRequired = adjustmentRequired;
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

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
