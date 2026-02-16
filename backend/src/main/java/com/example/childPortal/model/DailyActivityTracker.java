package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "daily_activity_trackers")
public class DailyActivityTracker {
    @Id
    private String id;
    private String helpRequestId;
    private String socialWorkerId;
    private LocalDate trackingDate;
    
    private List<DailyActivity> activities;
    private List<ScheduledService> scheduledServices;
    
    // Daily summary
    private int totalScheduled;
    private int completedCount;
    private int pendingCount;
    private int missedCount;
    
    // Flags
    private boolean morningReminderSent;
    private boolean eveningCheckDone;
    private boolean allActivitiesProcessed;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static class DailyActivity {
        private String activityId;
        private String type; // SERVICE_DELIVERY, FOLLOW_UP, CHECK_IN, DOCUMENT_SUBMISSION, OTHER
        private String description;
        private String status; // PENDING, IN_PROGRESS, COMPLETED, MISSED, RESCHEDULED
        private LocalDateTime scheduledTime;
        private LocalDateTime completedTime;
        private String notes;
        private String relatedServiceItem;
        private String relatedFollowUpId;
        
        public DailyActivity() {}
        
        // Getters and Setters
        public String getActivityId() { return activityId; }
        public void setActivityId(String activityId) { this.activityId = activityId; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public LocalDateTime getScheduledTime() { return scheduledTime; }
        public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
        
        public LocalDateTime getCompletedTime() { return completedTime; }
        public void setCompletedTime(LocalDateTime completedTime) { this.completedTime = completedTime; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public String getRelatedServiceItem() { return relatedServiceItem; }
        public void setRelatedServiceItem(String relatedServiceItem) { this.relatedServiceItem = relatedServiceItem; }
        
        public String getRelatedFollowUpId() { return relatedFollowUpId; }
        public void setRelatedFollowUpId(String relatedFollowUpId) { this.relatedFollowUpId = relatedFollowUpId; }
    }
    
    public static class ScheduledService {
        private String serviceItem;
        private String resource;
        private LocalDateTime scheduledDateTime;
        private String status; // PENDING, AWAITING_UPDATE, COMPLETED, MISSED
        private boolean updateRequested;
        private LocalDateTime updateRequestedAt;
        
        public ScheduledService() {}
        
        // Getters and Setters
        public String getServiceItem() { return serviceItem; }
        public void setServiceItem(String serviceItem) { this.serviceItem = serviceItem; }
        
        public String getResource() { return resource; }
        public void setResource(String resource) { this.resource = resource; }
        
        public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
        public void setScheduledDateTime(LocalDateTime scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public boolean isUpdateRequested() { return updateRequested; }
        public void setUpdateRequested(boolean updateRequested) { this.updateRequested = updateRequested; }
        
        public LocalDateTime getUpdateRequestedAt() { return updateRequestedAt; }
        public void setUpdateRequestedAt(LocalDateTime updateRequestedAt) { this.updateRequestedAt = updateRequestedAt; }
    }
    
    public DailyActivityTracker() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.trackingDate = LocalDate.now();
        this.activities = new ArrayList<>();
        this.scheduledServices = new ArrayList<>();
        this.morningReminderSent = false;
        this.eveningCheckDone = false;
        this.allActivitiesProcessed = false;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    
    public String getSocialWorkerId() { return socialWorkerId; }
    public void setSocialWorkerId(String socialWorkerId) { this.socialWorkerId = socialWorkerId; }
    
    public LocalDate getTrackingDate() { return trackingDate; }
    public void setTrackingDate(LocalDate trackingDate) { this.trackingDate = trackingDate; }
    
    public List<DailyActivity> getActivities() { return activities; }
    public void setActivities(List<DailyActivity> activities) { this.activities = activities; }
    
    public List<ScheduledService> getScheduledServices() { return scheduledServices; }
    public void setScheduledServices(List<ScheduledService> scheduledServices) { this.scheduledServices = scheduledServices; }
    
    public int getTotalScheduled() { return totalScheduled; }
    public void setTotalScheduled(int totalScheduled) { this.totalScheduled = totalScheduled; }
    
    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }
    
    public int getPendingCount() { return pendingCount; }
    public void setPendingCount(int pendingCount) { this.pendingCount = pendingCount; }
    
    public int getMissedCount() { return missedCount; }
    public void setMissedCount(int missedCount) { this.missedCount = missedCount; }
    
    public boolean isMorningReminderSent() { return morningReminderSent; }
    public void setMorningReminderSent(boolean morningReminderSent) { this.morningReminderSent = morningReminderSent; }
    
    public boolean isEveningCheckDone() { return eveningCheckDone; }
    public void setEveningCheckDone(boolean eveningCheckDone) { this.eveningCheckDone = eveningCheckDone; }
    
    public boolean isAllActivitiesProcessed() { return allActivitiesProcessed; }
    public void setAllActivitiesProcessed(boolean allActivitiesProcessed) { this.allActivitiesProcessed = allActivitiesProcessed; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Helper methods
    public void updateCounts() {
        if (activities != null) {
            this.completedCount = (int) activities.stream()
                .filter(a -> "COMPLETED".equals(a.getStatus()))
                .count();
            this.pendingCount = (int) activities.stream()
                .filter(a -> "PENDING".equals(a.getStatus()) || "IN_PROGRESS".equals(a.getStatus()))
                .count();
            this.missedCount = (int) activities.stream()
                .filter(a -> "MISSED".equals(a.getStatus()))
                .count();
            this.totalScheduled = activities.size();
            this.allActivitiesProcessed = (completedCount + missedCount) == totalScheduled && totalScheduled > 0;
        }
        this.updatedAt = LocalDateTime.now();
    }
}
