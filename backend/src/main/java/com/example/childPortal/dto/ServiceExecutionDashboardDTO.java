package com.example.childPortal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ServiceExecutionDashboardDTO {
    private String socialWorkerId;
    private LocalDate date;
    
    // Summary counts
    private int todayFollowUpCount;
    private int pendingUpdatesCount;
    private int overdueServicesCount;
    private int activeServicesCount;
    
    // Today's schedule
    private List<ScheduledServiceDTO> todaySchedule;
    
    // Pending service updates (past scheduled time, no outcome)
    private List<PendingUpdateDTO> pendingUpdates;
    
    // Overdue services
    private List<OverdueServiceDTO> overdueServices;
    
    // Recent completions
    private List<RecentCompletionDTO> recentCompletions;
    
    // Upcoming follow-ups (next 7 days)
    private List<UpcomingFollowUpDTO> upcomingFollowUps;
    
    // Alerts
    private List<String> morningAlerts;
    private List<String> actionRequired;
    
    public static class ScheduledServiceDTO {
        private String helpRequestId;
        private String trackingId;
        private String serviceItem;
        private String resourceName;
        private String resourceOrganization;
        private String scheduledTime;
        private String location;
        private String status;
        
        // Getters and Setters
        public String getHelpRequestId() { return helpRequestId; }
        public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
        
        public String getTrackingId() { return trackingId; }
        public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
        
        public String getServiceItem() { return serviceItem; }
        public void setServiceItem(String serviceItem) { this.serviceItem = serviceItem; }
        
        public String getResourceName() { return resourceName; }
        public void setResourceName(String resourceName) { this.resourceName = resourceName; }
        
        public String getResourceOrganization() { return resourceOrganization; }
        public void setResourceOrganization(String resourceOrganization) { this.resourceOrganization = resourceOrganization; }
        
        public String getScheduledTime() { return scheduledTime; }
        public void setScheduledTime(String scheduledTime) { this.scheduledTime = scheduledTime; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    public static class PendingUpdateDTO {
        private String helpRequestId;
        private String trackingId;
        private String serviceItem;
        private LocalDateTime scheduledDateTime;
        private String resourceName;
        private long hoursPastDue;
        
        // Getters and Setters
        public String getHelpRequestId() { return helpRequestId; }
        public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
        
        public String getTrackingId() { return trackingId; }
        public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
        
        public String getServiceItem() { return serviceItem; }
        public void setServiceItem(String serviceItem) { this.serviceItem = serviceItem; }
        
        public LocalDateTime getScheduledDateTime() { return scheduledDateTime; }
        public void setScheduledDateTime(LocalDateTime scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }
        
        public String getResourceName() { return resourceName; }
        public void setResourceName(String resourceName) { this.resourceName = resourceName; }
        
        public long getHoursPastDue() { return hoursPastDue; }
        public void setHoursPastDue(long hoursPastDue) { this.hoursPastDue = hoursPastDue; }
    }
    
    public static class OverdueServiceDTO {
        private String helpRequestId;
        private String trackingId;
        private String serviceItem;
        private LocalDate originalDate;
        private int daysPastDue;
        private int rescheduleCount;
        
        // Getters and Setters
        public String getHelpRequestId() { return helpRequestId; }
        public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
        
        public String getTrackingId() { return trackingId; }
        public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
        
        public String getServiceItem() { return serviceItem; }
        public void setServiceItem(String serviceItem) { this.serviceItem = serviceItem; }
        
        public LocalDate getOriginalDate() { return originalDate; }
        public void setOriginalDate(LocalDate originalDate) { this.originalDate = originalDate; }
        
        public int getDaysPastDue() { return daysPastDue; }
        public void setDaysPastDue(int daysPastDue) { this.daysPastDue = daysPastDue; }
        
        public int getRescheduleCount() { return rescheduleCount; }
        public void setRescheduleCount(int rescheduleCount) { this.rescheduleCount = rescheduleCount; }
    }
    
    public static class RecentCompletionDTO {
        private String helpRequestId;
        private String trackingId;
        private String serviceItem;
        private LocalDateTime completedAt;
        private String outcome;
        
        // Getters and Setters
        public String getHelpRequestId() { return helpRequestId; }
        public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
        
        public String getTrackingId() { return trackingId; }
        public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
        
        public String getServiceItem() { return serviceItem; }
        public void setServiceItem(String serviceItem) { this.serviceItem = serviceItem; }
        
        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
        
        public String getOutcome() { return outcome; }
        public void setOutcome(String outcome) { this.outcome = outcome; }
    }
    
    public static class UpcomingFollowUpDTO {
        private String id;
        private String helpRequestId;
        private String trackingId;
        private String childName;
        private String type;
        private LocalDateTime scheduledDate;
        private String priority;
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getHelpRequestId() { return helpRequestId; }
        public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
        
        public String getTrackingId() { return trackingId; }
        public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
        
        public String getChildName() { return childName; }
        public void setChildName(String childName) { this.childName = childName; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public LocalDateTime getScheduledDate() { return scheduledDate; }
        public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
        
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }
    
    public ServiceExecutionDashboardDTO() {}
    
    // Getters and Setters
    public String getSocialWorkerId() { return socialWorkerId; }
    public void setSocialWorkerId(String socialWorkerId) { this.socialWorkerId = socialWorkerId; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public int getTodayFollowUpCount() { return todayFollowUpCount; }
    public void setTodayFollowUpCount(int todayFollowUpCount) { this.todayFollowUpCount = todayFollowUpCount; }
    
    public int getPendingUpdatesCount() { return pendingUpdatesCount; }
    public void setPendingUpdatesCount(int pendingUpdatesCount) { this.pendingUpdatesCount = pendingUpdatesCount; }
    
    public int getOverdueServicesCount() { return overdueServicesCount; }
    public void setOverdueServicesCount(int overdueServicesCount) { this.overdueServicesCount = overdueServicesCount; }
    
    public int getActiveServicesCount() { return activeServicesCount; }
    public void setActiveServicesCount(int activeServicesCount) { this.activeServicesCount = activeServicesCount; }
    
    public List<ScheduledServiceDTO> getTodaySchedule() { return todaySchedule; }
    public void setTodaySchedule(List<ScheduledServiceDTO> todaySchedule) { this.todaySchedule = todaySchedule; }
    
    public List<PendingUpdateDTO> getPendingUpdates() { return pendingUpdates; }
    public void setPendingUpdates(List<PendingUpdateDTO> pendingUpdates) { this.pendingUpdates = pendingUpdates; }
    
    public List<OverdueServiceDTO> getOverdueServices() { return overdueServices; }
    public void setOverdueServices(List<OverdueServiceDTO> overdueServices) { this.overdueServices = overdueServices; }
    
    public List<RecentCompletionDTO> getRecentCompletions() { return recentCompletions; }
    public void setRecentCompletions(List<RecentCompletionDTO> recentCompletions) { this.recentCompletions = recentCompletions; }
    
    public List<UpcomingFollowUpDTO> getUpcomingFollowUps() { return upcomingFollowUps; }
    public void setUpcomingFollowUps(List<UpcomingFollowUpDTO> upcomingFollowUps) { this.upcomingFollowUps = upcomingFollowUps; }
    
    public List<String> getMorningAlerts() { return morningAlerts; }
    public void setMorningAlerts(List<String> morningAlerts) { this.morningAlerts = morningAlerts; }
    
    public List<String> getActionRequired() { return actionRequired; }
    public void setActionRequired(List<String> actionRequired) { this.actionRequired = actionRequired; }
}
