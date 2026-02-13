package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "monitoring_checklists")
public class MonitoringChecklist {
    @Id
    private String id;
    private String helpRequestId;
    private String socialWorkerId;
    
    private List<ChecklistItem> items;
    private String overallStatus; // PENDING, IN_PROGRESS, COMPLETED
    private int completedCount;
    private int totalCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static class ChecklistItem {
        private String itemId;
        private String title;
        private String description;
        private String category; // SAFETY, HEALTH, EDUCATION, WELFARE, ENVIRONMENT
        private boolean completed;
        private String completedBy;
        private LocalDateTime completedAt;
        private String notes;
        private int order;
        
        public ChecklistItem() {}
        
        public ChecklistItem(String itemId, String title, String category, int order) {
            this.itemId = itemId;
            this.title = title;
            this.category = category;
            this.order = order;
            this.completed = false;
        }
        
        // Getters and Setters
        public String getItemId() { return itemId; }
        public void setItemId(String itemId) { this.itemId = itemId; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
        
        public String getCompletedBy() { return completedBy; }
        public void setCompletedBy(String completedBy) { this.completedBy = completedBy; }
        
        public LocalDateTime getCompletedAt() { return completedAt; }
        public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public int getOrder() { return order; }
        public void setOrder(int order) { this.order = order; }
    }
    
    public MonitoringChecklist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.overallStatus = "PENDING";
        this.completedCount = 0;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    
    public String getSocialWorkerId() { return socialWorkerId; }
    public void setSocialWorkerId(String socialWorkerId) { this.socialWorkerId = socialWorkerId; }
    
    public List<ChecklistItem> getItems() { return items; }
    public void setItems(List<ChecklistItem> items) { 
        this.items = items;
        this.totalCount = items != null ? items.size() : 0;
    }
    
    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }
    
    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }
    
    public int getTotalCount() { return totalCount; }
    public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Helper methods
    public void updateCompletionCount() {
        if (items != null) {
            this.completedCount = (int) items.stream().filter(ChecklistItem::isCompleted).count();
            this.totalCount = items.size();
            if (completedCount == totalCount && totalCount > 0) {
                this.overallStatus = "COMPLETED";
            } else if (completedCount > 0) {
                this.overallStatus = "IN_PROGRESS";
            }
        }
        this.updatedAt = LocalDateTime.now();
    }
}
