package com.example.childPortal.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class ServiceItemExecutionDTO {
    private String serviceItem;
    private int index;
    private String status;
    private String assignedResource;
    private String resourceOrganization;
    private LocalDateTime scheduledDate;
    private LocalTime scheduledTime;
    private String notes;
    
    // Outcome tracking
    private String outcome;
    private String outcomeReason;
    private String outcomeNotes;
    private LocalDateTime outcomeRecordedAt;
    
    // Progress
    private Integer progressContribution;
    
    // Proof
    private List<String> proofUrls;
    private String proofDescription;
    
    // Rescheduling
    private LocalDateTime originalScheduledDate;
    private int rescheduleCount;
    private String lastRescheduleReason;
    
    // Follow-up
    private LocalDateTime nextFollowUpDate;
    private String followUpId;
    
    // Adjustment
    private String adjustmentPlan;
    private boolean adjustmentRequired;
    
    // Related help request info
    private String helpRequestId;
    private String trackingId;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    
    public ServiceItemExecutionDTO() {}
    
    // Getters and Setters
    public String getServiceItem() { return serviceItem; }
    public void setServiceItem(String serviceItem) { this.serviceItem = serviceItem; }
    
    public int getIndex() { return index; }
    public void setIndex(int index) { this.index = index; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getAssignedResource() { return assignedResource; }
    public void setAssignedResource(String assignedResource) { this.assignedResource = assignedResource; }
    
    public String getResourceOrganization() { return resourceOrganization; }
    public void setResourceOrganization(String resourceOrganization) { this.resourceOrganization = resourceOrganization; }
    
    public LocalDateTime getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
    
    public LocalTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalTime scheduledTime) { this.scheduledTime = scheduledTime; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
    
    public String getOutcomeReason() { return outcomeReason; }
    public void setOutcomeReason(String outcomeReason) { this.outcomeReason = outcomeReason; }
    
    public String getOutcomeNotes() { return outcomeNotes; }
    public void setOutcomeNotes(String outcomeNotes) { this.outcomeNotes = outcomeNotes; }
    
    public LocalDateTime getOutcomeRecordedAt() { return outcomeRecordedAt; }
    public void setOutcomeRecordedAt(LocalDateTime outcomeRecordedAt) { this.outcomeRecordedAt = outcomeRecordedAt; }
    
    public Integer getProgressContribution() { return progressContribution; }
    public void setProgressContribution(Integer progressContribution) { this.progressContribution = progressContribution; }
    
    public List<String> getProofUrls() { return proofUrls; }
    public void setProofUrls(List<String> proofUrls) { this.proofUrls = proofUrls; }
    
    public String getProofDescription() { return proofDescription; }
    public void setProofDescription(String proofDescription) { this.proofDescription = proofDescription; }
    
    public LocalDateTime getOriginalScheduledDate() { return originalScheduledDate; }
    public void setOriginalScheduledDate(LocalDateTime originalScheduledDate) { this.originalScheduledDate = originalScheduledDate; }
    
    public int getRescheduleCount() { return rescheduleCount; }
    public void setRescheduleCount(int rescheduleCount) { this.rescheduleCount = rescheduleCount; }
    
    public String getLastRescheduleReason() { return lastRescheduleReason; }
    public void setLastRescheduleReason(String lastRescheduleReason) { this.lastRescheduleReason = lastRescheduleReason; }
    
    public LocalDateTime getNextFollowUpDate() { return nextFollowUpDate; }
    public void setNextFollowUpDate(LocalDateTime nextFollowUpDate) { this.nextFollowUpDate = nextFollowUpDate; }
    
    public String getFollowUpId() { return followUpId; }
    public void setFollowUpId(String followUpId) { this.followUpId = followUpId; }
    
    public String getAdjustmentPlan() { return adjustmentPlan; }
    public void setAdjustmentPlan(String adjustmentPlan) { this.adjustmentPlan = adjustmentPlan; }
    
    public boolean isAdjustmentRequired() { return adjustmentRequired; }
    public void setAdjustmentRequired(boolean adjustmentRequired) { this.adjustmentRequired = adjustmentRequired; }
    
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    
    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
