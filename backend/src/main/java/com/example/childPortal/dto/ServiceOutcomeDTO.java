package com.example.childPortal.dto;

import java.time.LocalDate;
import java.util.List;

public class ServiceOutcomeDTO {
    private String serviceItem;
    private int serviceItemIndex;
    
    /**
     * Outcome type:
     * - COMPLETED_SUCCESSFULLY
     * - PARTIALLY_COMPLETED
     * - NOT_DELIVERED
     * - RESCHEDULED
     */
    private String outcome;
    
    /**
     * Reason for NOT_DELIVERED:
     * - RESOURCE_UNAVAILABLE
     * - USER_UNAVAILABLE
     * - INCORRECT_INFO
     */
    private String outcomeReason;
    
    private String outcomeNotes;
    
    // For proof upload
    private List<String> proofUrls;
    private String proofDescription;
    
    // For rescheduling
    private LocalDate newScheduledDate;
    private String newScheduledTime;
    private String rescheduleReason;
    
    // For adjustment plan (PARTIALLY_COMPLETED)
    private String adjustmentPlan;
    
    public ServiceOutcomeDTO() {}
    
    // Getters and Setters
    public String getServiceItem() { return serviceItem; }
    public void setServiceItem(String serviceItem) { this.serviceItem = serviceItem; }
    
    public int getServiceItemIndex() { return serviceItemIndex; }
    public void setServiceItemIndex(int serviceItemIndex) { this.serviceItemIndex = serviceItemIndex; }
    
    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
    
    public String getOutcomeReason() { return outcomeReason; }
    public void setOutcomeReason(String outcomeReason) { this.outcomeReason = outcomeReason; }
    
    public String getOutcomeNotes() { return outcomeNotes; }
    public void setOutcomeNotes(String outcomeNotes) { this.outcomeNotes = outcomeNotes; }
    
    public List<String> getProofUrls() { return proofUrls; }
    public void setProofUrls(List<String> proofUrls) { this.proofUrls = proofUrls; }
    
    public String getProofDescription() { return proofDescription; }
    public void setProofDescription(String proofDescription) { this.proofDescription = proofDescription; }
    
    public LocalDate getNewScheduledDate() { return newScheduledDate; }
    public void setNewScheduledDate(LocalDate newScheduledDate) { this.newScheduledDate = newScheduledDate; }
    
    public String getNewScheduledTime() { return newScheduledTime; }
    public void setNewScheduledTime(String newScheduledTime) { this.newScheduledTime = newScheduledTime; }
    
    public String getRescheduleReason() { return rescheduleReason; }
    public void setRescheduleReason(String rescheduleReason) { this.rescheduleReason = rescheduleReason; }
    
    public String getAdjustmentPlan() { return adjustmentPlan; }
    public void setAdjustmentPlan(String adjustmentPlan) { this.adjustmentPlan = adjustmentPlan; }
}
