package com.example.childPortal.dto;

import com.example.childPortal.model.CaseTimelineEvent.EventType; 
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.Priority;
import java.time.LocalDateTime;
import java.util.Map;

public class CaseTimelineDTO {
private String id;
private String caseId;
private String helpRequestId;
private String trackingId; 

private EventType eventType; 
private String title;
private String description; 
private String details;

private String performedByUserId;
private String performedByRole;
private String performedByName;
private String performedByAvatar; 

private String targetUserId; 
private String targetRole; 
private String targetName;

private CaseStatus previousStatus; 
private CaseStatus newStatus; 
private String statusChangeReason;

private Priority previousPriority; 
private Priority newPriority;
  
private String assignedToUserId;
private String assignedToName; 
private String assignedFromUserId; 
private String assignedFromName;

private LocalDateTime eventTime;
private String timeAgo; 


private String icon; 

private String color; 
private boolean isMajorEvent; 
public CaseTimelineDTO() {}

public String getId() { return id; }
public void setId(String id) { this.id = id; }
public String getCaseId() { return caseId; }
public void setCaseId(String caseId) { this.caseId = caseId; }
public String getHelpRequestId() { return helpRequestId; }
public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
public String getTrackingId() { return trackingId; }
public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
public EventType getEventType() { return eventType; }
public void setEventType(EventType eventType) { this.eventType = eventType; }
public String getTitle() { return title; }
public void setTitle(String title) { this.title = title; }

public String getDescription() { return description; }
public void setDescription(String description) { this.description = description; }
public String getDetails() { return details; }
public void setDetails(String details) { this.details = details; }
public String getPerformedByUserId() { return performedByUserId; }
public void setPerformedByUserId(String performedByUserId) { this.performedByUserId = performedByUserId; }
public String getPerformedByRole() { return performedByRole; }
public void setPerformedByRole(String performedByRole) { this.performedByRole = performedByRole; }
public String getPerformedByName() { return performedByName; }
public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }
public String getPerformedByAvatar() { return performedByAvatar; }
public void setPerformedByAvatar(String performedByAvatar) { this.performedByAvatar = performedByAvatar; }
public String getTargetUserId() { return targetUserId; }
public void setTargetUserId(String targetUserId) { this.targetUserId = targetUserId; }
public String getTargetRole() { return targetRole; }

public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
public String getTargetName() { return targetName; }
public void setTargetName(String targetName) { this.targetName = targetName; }
public CaseStatus getPreviousStatus() { return previousStatus; }
public void setPreviousStatus(CaseStatus previousStatus) { this.previousStatus = previousStatus; }
public CaseStatus getNewStatus() { return newStatus; }
public void setNewStatus(CaseStatus newStatus) { this.newStatus = newStatus; }
public String getStatusChangeReason() { return statusChangeReason; }
public void setStatusChangeReason(String statusChangeReason) { this.statusChangeReason = statusChangeReason; }
public Priority getPreviousPriority() { return previousPriority; }
public void setPreviousPriority(Priority previousPriority) { this.previousPriority = previousPriority; }
public Priority getNewPriority() { return newPriority; }
public void setNewPriority(Priority newPriority) { this.newPriority = newPriority; }
public String getAssignedToUserId() { return assignedToUserId; }
public void setAssignedToUserId(String assignedToUserId) { this.assignedToUserId = assignedToUserId; }

public String getAssignedToName() { return assignedToName; }
public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
public String getAssignedFromUserId() { return assignedFromUserId; }
public void setAssignedFromUserId(String assignedFromUserId) { this.assignedFromUserId = assignedFromUserId; }
public String getAssignedFromName() { return assignedFromName; }
public void setAssignedFromName(String assignedFromName) { this.assignedFromName = assignedFromName; }
public LocalDateTime getEventTime() { return eventTime; }
public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
public String getTimeAgo() { return timeAgo; }
public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }
public Map<String, String> getMetadata() { return metadata; }
public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }
public String getEvidenceUrl() { return evidenceUrl; }
public void setEvidenceUrl(String evidenceUrl) { this.evidenceUrl = evidenceUrl; }
public String getDocumentUrl() { return documentUrl; }
public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

public String getDocumentName() { return documentName; }
public void setDocumentName(String documentName) { this.documentName = documentName; }
public String getIcon() { return icon; }
public void setIcon(String icon) { this.icon = icon; }
public String getColor() { return color; }
public void setColor(String color) { this.color = color; }
public boolean isMajorEvent() { return isMajorEvent; }
public void setMajorEvent(boolean majorEvent) { isMajorEvent = majorEvent; }
public boolean isSystemEvent() { return isSystemEvent; }
public void setSystemEvent(boolean systemEvent) { isSystemEvent = systemEvent; }
public boolean isUserAction() { return isUserAction; }
public void setUserAction(boolean userAction) { isUserAction = userAction; } }
