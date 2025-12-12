package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document; 
import java.time.LocalDateTime;
import java.util.Map;
@Document(collection = "case_timeline_events")

public class CaseTimelineEvent {

@Id
private String id;
private String caseId;
private String helpRequestId; 

private EventType eventType;
private String title;
private String description;
private String details; 

private String performedByUserId;
private String performedByRole; 
private String performedByName;

private String targetUserId;
private String targetRole;
private String targetName;

private Case.CaseStatus previousStatus; 
private Case.CaseStatus newStatus;
private String statusChangeReason;

private LocalDateTime eventTime;
private String ipAddress;
private String userAgent;
private Map<String, String> metadata;

private String evidenceUrl; 
private String documentUrl;

private Priority previousPriority; 
private Priority newPriority;

private String assignedToUserId; 
private String assignedFromUserId;

public enum EventType {
CASE_CREATED,
CASE_APPROVED,
CASE_REJECTED,
CASE_ASSIGNED,
CASE_UNASSIGNED,
STATUS_CHANGED,
PRIORITY_CHANGED,
INFORMATION_REQUESTED,
INFORMATION_PROVIDED,
EVIDENCE_ADDED,
DOCUMENT_ADDED,
NOTE_ADDED,
MEETING_SCHEDULED,
MEETING_COMPLETED,
FOLLOWUP_CREATED,
CASE_RESOLVED,
CASE_CLOSED,
FEEDBACK_SUBMITTED,
SERVICE_OFFERED,
SERVICE_ACCEPTED,
SERVICE_REJECTED,
SERVICE_COMPLETED,
SYSTEM_AUTO_ACTION,
ADMIN_OVERRIDE,
OTHER
}

public CaseTimelineEvent() { 
    this.eventTime = LocalDateTime.now();
}

public String getId() { return id; }
public void setId(String id) { this.id = id; }

public String getCaseId() { return caseId; }
public void setCaseId(String caseId) { this.caseId = caseId; }

public String getHelpRequestId() { return helpRequestId; }
public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }

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

public String getTargetUserId() { return targetUserId; }
public void setTargetUserId(String targetUserId) { this.targetUserId = targetUserId; }

public String getTargetRole() { return targetRole; }
public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

public String getTargetName() { return targetName; }
public void setTargetName(String targetName) { this.targetName = targetName; }

public Case.CaseStatus getPreviousStatus() { return previousStatus; }
public void setPreviousStatus(Case.CaseStatus previousStatus) { this.previousStatus = previousStatus; }

public Case.CaseStatus getNewStatus() { return newStatus; }
public void setNewStatus(Case.CaseStatus newStatus) { this.newStatus = newStatus; }

public String getStatusChangeReason() { return statusChangeReason; }
public void setStatusChangeReason(String statusChangeReason) { this.statusChangeReason = statusChangeReason; }

public LocalDateTime getEventTime() { return eventTime; }
public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }

public String getIpAddress() { return ipAddress; }
public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

public String getUserAgent() { return userAgent; }
public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

public Map<String, String> getMetadata() { return metadata; }
public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }

public String getEvidenceUrl() { return evidenceUrl; }
public void setEvidenceUrl(String evidenceUrl) { this.evidenceUrl = evidenceUrl; }

public String getDocumentUrl() { return documentUrl; }
public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

public Priority getPreviousPriority() { return previousPriority; }
public void setPreviousPriority(Priority previousPriority) { this.previousPriority = previousPriority; }

public Priority getNewPriority() { return newPriority; }
public void setNewPriority(Priority newPriority) { this.newPriority = newPriority; }

public String getAssignedToUserId() { return assignedToUserId; }
public void setAssignedToUserId(String assignedToUserId) { this.assignedToUserId = assignedToUserId; }

public String getAssignedFromUserId() { return assignedFromUserId; }
public void setAssignedFromUserId(String assignedFromUserId) { this.assignedFromUserId = assignedFromUserId; }

}




