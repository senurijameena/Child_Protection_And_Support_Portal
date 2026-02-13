package com.example.childPortal.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ServiceExecutionStatusDTO {
    private String helpRequestId;
    private String trackingId;
    private String status;
    
    // Progress tracking
    private int progress;
    private boolean serviceStarted;
    private boolean resourcesAssigned;
    private boolean allServicesCompleted;
    private boolean finalAssessmentCompleted;
    private boolean caseFinalized;
    
    // Timestamps
    private LocalDateTime serviceStartedAt;
    private LocalDateTime serviceFinalizedAt;
    private LocalDateTime finalAssessmentAt;
    private LocalDateTime completedAt;
    
    // Service items summary
    private int totalServices;
    private int completedServices;
    private int partiallyCompletedServices;
    private int pendingServices;
    private int scheduledServices;
    
    // Service item details
    private List<ServiceItemStatusDTO> serviceItems;
    
    // Next actions
    private boolean canStartService;
    private boolean canAssignResources;
    private boolean canFinalizeCase;
    private boolean canSubmitFinalAssessment;
    private boolean canMarkCompleted;
    
    // Alerts/Warnings
    private List<String> alerts;
    private List<String> pendingActions;
    
    public static class ServiceItemStatusDTO {
        private String serviceItem;
        private int index;
        private String status;
        private String outcome;
        private String assignedResource;
        private String resourceOrganization;
        private LocalDateTime scheduledDate;
        private String scheduledTime;
        private int progressContribution;
        private boolean hasProof;
        private int rescheduleCount;
        
        // Getters and Setters
        public String getServiceItem() { return serviceItem; }
        public void setServiceItem(String serviceItem) { this.serviceItem = serviceItem; }
        
        public int getIndex() { return index; }
        public void setIndex(int index) { this.index = index; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getOutcome() { return outcome; }
        public void setOutcome(String outcome) { this.outcome = outcome; }
        
        public String getAssignedResource() { return assignedResource; }
        public void setAssignedResource(String assignedResource) { this.assignedResource = assignedResource; }
        
        public String getResourceOrganization() { return resourceOrganization; }
        public void setResourceOrganization(String resourceOrganization) { this.resourceOrganization = resourceOrganization; }
        
        public LocalDateTime getScheduledDate() { return scheduledDate; }
        public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
        
        public String getScheduledTime() { return scheduledTime; }
        public void setScheduledTime(String scheduledTime) { this.scheduledTime = scheduledTime; }
        
        public int getProgressContribution() { return progressContribution; }
        public void setProgressContribution(int progressContribution) { this.progressContribution = progressContribution; }
        
        public boolean isHasProof() { return hasProof; }
        public void setHasProof(boolean hasProof) { this.hasProof = hasProof; }
        
        public int getRescheduleCount() { return rescheduleCount; }
        public void setRescheduleCount(int rescheduleCount) { this.rescheduleCount = rescheduleCount; }
    }
    
    public ServiceExecutionStatusDTO() {}
    
    // Getters and Setters
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    
    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    
    public boolean isServiceStarted() { return serviceStarted; }
    public void setServiceStarted(boolean serviceStarted) { this.serviceStarted = serviceStarted; }
    
    public boolean isResourcesAssigned() { return resourcesAssigned; }
    public void setResourcesAssigned(boolean resourcesAssigned) { this.resourcesAssigned = resourcesAssigned; }
    
    public boolean isAllServicesCompleted() { return allServicesCompleted; }
    public void setAllServicesCompleted(boolean allServicesCompleted) { this.allServicesCompleted = allServicesCompleted; }
    
    public boolean isFinalAssessmentCompleted() { return finalAssessmentCompleted; }
    public void setFinalAssessmentCompleted(boolean finalAssessmentCompleted) { this.finalAssessmentCompleted = finalAssessmentCompleted; }
    
    public boolean isCaseFinalized() { return caseFinalized; }
    public void setCaseFinalized(boolean caseFinalized) { this.caseFinalized = caseFinalized; }
    
    public LocalDateTime getServiceStartedAt() { return serviceStartedAt; }
    public void setServiceStartedAt(LocalDateTime serviceStartedAt) { this.serviceStartedAt = serviceStartedAt; }
    
    public LocalDateTime getServiceFinalizedAt() { return serviceFinalizedAt; }
    public void setServiceFinalizedAt(LocalDateTime serviceFinalizedAt) { this.serviceFinalizedAt = serviceFinalizedAt; }
    
    public LocalDateTime getFinalAssessmentAt() { return finalAssessmentAt; }
    public void setFinalAssessmentAt(LocalDateTime finalAssessmentAt) { this.finalAssessmentAt = finalAssessmentAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public int getTotalServices() { return totalServices; }
    public void setTotalServices(int totalServices) { this.totalServices = totalServices; }
    
    public int getCompletedServices() { return completedServices; }
    public void setCompletedServices(int completedServices) { this.completedServices = completedServices; }
    
    public int getPartiallyCompletedServices() { return partiallyCompletedServices; }
    public void setPartiallyCompletedServices(int partiallyCompletedServices) { this.partiallyCompletedServices = partiallyCompletedServices; }
    
    public int getPendingServices() { return pendingServices; }
    public void setPendingServices(int pendingServices) { this.pendingServices = pendingServices; }
    
    public int getScheduledServices() { return scheduledServices; }
    public void setScheduledServices(int scheduledServices) { this.scheduledServices = scheduledServices; }
    
    public List<ServiceItemStatusDTO> getServiceItems() { return serviceItems; }
    public void setServiceItems(List<ServiceItemStatusDTO> serviceItems) { this.serviceItems = serviceItems; }
    
    public boolean isCanStartService() { return canStartService; }
    public void setCanStartService(boolean canStartService) { this.canStartService = canStartService; }
    
    public boolean isCanAssignResources() { return canAssignResources; }
    public void setCanAssignResources(boolean canAssignResources) { this.canAssignResources = canAssignResources; }
    
    public boolean isCanFinalizeCase() { return canFinalizeCase; }
    public void setCanFinalizeCase(boolean canFinalizeCase) { this.canFinalizeCase = canFinalizeCase; }
    
    public boolean isCanSubmitFinalAssessment() { return canSubmitFinalAssessment; }
    public void setCanSubmitFinalAssessment(boolean canSubmitFinalAssessment) { this.canSubmitFinalAssessment = canSubmitFinalAssessment; }
    
    public boolean isCanMarkCompleted() { return canMarkCompleted; }
    public void setCanMarkCompleted(boolean canMarkCompleted) { this.canMarkCompleted = canMarkCompleted; }
    
    public List<String> getAlerts() { return alerts; }
    public void setAlerts(List<String> alerts) { this.alerts = alerts; }
    
    public List<String> getPendingActions() { return pendingActions; }
    public void setPendingActions(List<String> pendingActions) { this.pendingActions = pendingActions; }
}
