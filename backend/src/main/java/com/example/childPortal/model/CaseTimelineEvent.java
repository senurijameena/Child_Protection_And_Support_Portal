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
private HelpRequest.RequestStatus previousHelpRequestStatus;
private HelpRequest.RequestStatus newHelpRequestStatus;
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
    SYSTEM_AUTO_ACTION,
    ADMIN_OVERRIDE,

    HELP_REQUEST_CREATED,
    HELP_REQUEST_SUBMITTED,
    HELP_REQUEST_UNDER_REVIEW,
    HELP_REQUEST_ASSIGNED,
    HELP_REQUEST_UNASSIGNED,
    HELP_REQUEST_STATUS_CHANGED,
    HELP_REQUEST_PRIORITY_CHANGED,
    HELP_REQUEST_IN_PROGRESS,
    HELP_REQUEST_COMPLETED,
    HELP_REQUEST_REJECTED,
    HELP_REQUEST_CANCELLED,
    SERVICE_OFFER_CREATED,
    SERVICE_OFFER_ACCEPTED,
    SERVICE_OFFER_DECLINED,
    SERVICE_OFFER_WITHDRAWN,
    SERVICE_STARTED,
    SERVICE_COMPLETED,
    SERVICE_CANCELLED,
    HELP_REQUEST_TRANSFER_REQUESTED,
    HELP_REQUEST_TRANSFER_APPROVED,
    HELP_REQUEST_TRANSFER_REJECTED,
    HELP_REQUEST_NOTE_ADDED,
    HELP_REQUEST_DOCUMENT_ADDED,
    HELP_REQUEST_UPDATE_PROVIDED,
    HELP_REQUEST_FEEDBACK_SUBMITTED,
    
    // Service Execution Events
    SERVICE_EXECUTION_STARTED,
    SERVICE_EXECUTION_RESOURCE_ASSIGNED,
    SERVICE_EXECUTION_PROGRESS_UPDATED,
    SERVICE_ITEM_COMPLETED,
    SERVICE_ITEM_PARTIALLY_COMPLETED,
    SERVICE_ITEM_NOT_DELIVERED,
    SERVICE_ITEM_RESCHEDULED,
    SERVICE_ITEM_PROOF_UPLOADED,
    SERVICE_EXECUTION_ALL_COMPLETED,
    SERVICE_EXECUTION_FINALIZED,
    FINAL_ASSESSMENT_SUBMITTED,
    CASE_MARKED_COMPLETED,
    MONITORING_CHECKLIST_UPDATED,
    DAILY_ACTIVITY_LOGGED,
    FOLLOW_UP_SCHEDULED_AUTO,
    FOLLOW_UP_REMINDER_SENT,
    
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

public HelpRequest.RequestStatus getPreviousHelpRequestStatus() { return previousHelpRequestStatus; }
public void setPreviousHelpRequestStatus(HelpRequest.RequestStatus previousHelpRequestStatus) { this.previousHelpRequestStatus = previousHelpRequestStatus; }

public HelpRequest.RequestStatus getNewHelpRequestStatus() { return newHelpRequestStatus; }
public void setNewHelpRequestStatus(HelpRequest.RequestStatus newHelpRequestStatus) { this.newHelpRequestStatus = newHelpRequestStatus; }

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




