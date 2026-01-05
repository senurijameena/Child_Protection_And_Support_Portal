package com.example.childPortal.dto;

import com.example.childPortal.model.CaseTimelineEvent.EventType;
import java.time.LocalDateTime;

public class CaseTimelineDTO {
    private String id;
    private String caseId;
    private String helpRequestId;
    private EventType eventType;
    private String description;
    private String performedByUserId;
    private String performedByName;
    private LocalDateTime eventTime;

    public CaseTimelineDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPerformedByUserId() { return performedByUserId; }
    public void setPerformedByUserId(String performedByUserId) { this.performedByUserId = performedByUserId; }
    public String getPerformedByName() { return performedByName; }
    public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }
    public LocalDateTime getEventTime() { return eventTime; }
    public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
}
