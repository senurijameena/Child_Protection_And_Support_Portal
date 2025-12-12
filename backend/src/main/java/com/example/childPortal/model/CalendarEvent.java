package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "calendar_events")
public class CalendarEvent {

    @Id
    private String id;

    @DBRef
    private SocialWorkerCalendar calendar;

    @DBRef
    private Case relatedCase;
    
    private String eventType;
    private String title;
    private String description;
    
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Duration duration;
    
    private String location;
    private String purpose;
    
    private List<String> participants; 
    
    private String status; 
    
    private boolean reminderEnabled;
    private LocalDateTime reminderTime;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @DBRef
    private SocialWorker createdBy;

    public CalendarEvent() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { 
      return id; 
    }
    public void setId(String id) { 
      this.id = id; 
    }
    
    public SocialWorkerCalendar getCalendar() { 
      return calendar; 
    }
    public void setCalendar(SocialWorkerCalendar calendar) { 
      this.calendar = calendar; 
    }
    
    public Case getRelatedCase() { 
      return relatedCase; 
    }
    public void setRelatedCase(Case relatedCase) { 
      this.relatedCase = relatedCase;
    }
    
    public String getEventType() { 
      return eventType; 
    }
    public void setEventType(String eventType) { 
      this.eventType = eventType; 
    }
    
    public String getTitle() {
      return title; 
    }
    public void setTitle(String title) { 
      this.title = title; 
    }
    
    public String getDescription() { 
      return description; 
    }
    public void setDescription(String description) { 
      this.description = description; 
    }
    
    public LocalDate getEventDate() { 
      return eventDate; 
    }
    public void setEventDate(LocalDate eventDate) { 
      this.eventDate = eventDate; 
    }
    
    public LocalTime getStartTime() { 
      return startTime; 
    }
    public void setStartTime(LocalTime startTime) {
      this.startTime = startTime;
    }
    
    public LocalTime getEndTime() {
      return endTime; 
    }
    public void setEndTime(LocalTime endTime) {
      this.endTime = endTime; 
    }
    
    public Duration getDuration() {
      return duration; 
    }
    public void setDuration(Duration duration) {
      this.duration = duration;
    }
    
    public String getLocation() {
      return location; 
    }
    public void setLocation(String location) {
      this.location = location; 
    }
    
    public String getPurpose() {
      return purpose; 
    }
    public void setPurpose(String purpose) { 
      this.purpose = purpose; 
    }
    
    public List<String> getParticipants() {
      return participants;
    }
    public void setParticipants(List<String> participants) { 
      this.participants = participants;
    }
    
    public String getStatus() {
      return status; 
    }
    public void setStatus(String status) {
      this.status = status; 
    }
    
    public boolean isReminderEnabled() {
      return reminderEnabled;
    }
    public void setReminderEnabled(boolean reminderEnabled) {
      this.reminderEnabled = reminderEnabled; 
    }
    
    public LocalDateTime getReminderTime() {
      return reminderTime; 
    }
    public void setReminderTime(LocalDateTime reminderTime) { 
      this.reminderTime = reminderTime;
    }
    
    public LocalDateTime getCreatedAt() {
      return createdAt; 
    }
    public void setCreatedAt(LocalDateTime createdAt) {
      this.createdAt = createdAt; 
    }
    
    public SocialWorker getCreatedBy() {
      return createdBy; 
    }
    public void setCreatedBy(SocialWorker createdBy) {
      this.createdBy = createdBy; 
    }
}
