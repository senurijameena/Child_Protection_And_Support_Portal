package com.example.childPortal.dto;

import com.example.childPortal.model.AppointmentStatus;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

public class AppointmentDetailDTO {
    private String id; 
    private String eventType;
    private String title;
    private String caseNumber;
    private String location;
    private String duration;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private List<String> participants;
    private AppointmentStatus status;
    private boolean canMarkComplete;
    private boolean canReschedule;

    private LocalDateTime eventDateTime;
    private boolean isOverdue;
    private String socialWorkerId;
    private String socialWorkerName;
    private String caseId;

    public AppointmentDetailDTO() {
    }

    public AppointmentDetailDTO(String id, String eventType, String title, String caseNumber, 
                                String location, String duration, LocalTime startTime, 
                                LocalTime endTime, String purpose, List<String> participants, 
                                AppointmentStatus status, boolean canMarkComplete, boolean canReschedule) {
        this.id = id;
        this.eventType = eventType;
        this.title = title;
        this.caseNumber = caseNumber;
        this.location = location;
        this.duration = duration;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.participants = participants;
        this.status = status;
        this.canMarkComplete = canMarkComplete;
        this.canReschedule = canReschedule;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getCaseNumber() {
        return caseNumber;
    }

    public void setCaseNumber(String caseNumber) {
        this.caseNumber = caseNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
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

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public boolean isCanMarkComplete() {
        return canMarkComplete;
    }

    public void setCanMarkComplete(boolean canMarkComplete) {
        this.canMarkComplete = canMarkComplete;
    }

    public boolean isCanReschedule() {
        return canReschedule;
    }

    public void setCanReschedule(boolean canReschedule) {
        this.canReschedule = canReschedule;
    }

    public LocalDateTime getEventDateTime() {
        return eventDateTime;
    }

    public void setEventDateTime(LocalDateTime eventDateTime) {
        this.eventDateTime = eventDateTime;
    }

    public boolean isOverdue() {
        return isOverdue;
    }

    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }

    public String getSocialWorkerId() {
        return socialWorkerId;
    }

    public void setSocialWorkerId(String socialWorkerId) {
        this.socialWorkerId = socialWorkerId;
    }

    public String getSocialWorkerName() {
        return socialWorkerName;
    }

    public void setSocialWorkerName(String socialWorkerName) {
        this.socialWorkerName = socialWorkerName;
    }

    public String getCaseId() {
        return caseId;
    }

    public void setCaseId(String caseId) {
        this.caseId = caseId;
    }

    public boolean isActive() {
        return status == AppointmentStatus.SCHEDULED || status == AppointmentStatus.IN_PROGRESS;
    }

    public boolean isCompleted() {
        return status == AppointmentStatus.COMPLETED;
    }

    public boolean isCancelled() {
        return status == AppointmentStatus.CANCELLED;
    }

    public Duration calculateDuration() {
        if (startTime != null && endTime != null) {
            return Duration.between(startTime, endTime);
        }
        return Duration.ZERO;
    }

    @Override
    public String toString() {
        return "AppointmentDetailDTO{" +
                "id='" + id + '\'' +
                ", eventType='" + eventType + '\'' +
                ", title='" + title + '\'' +
                ", caseNumber='" + caseNumber + '\'' +
                ", status=" + status +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                '}';
    }
}
