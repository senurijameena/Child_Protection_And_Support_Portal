package com.example.childPortal.dto;
import java.time.LocalDateTime;

public class ConversationDTO {
    private String id;
    private String participantId;
    private String participantName;
    private String participantRole;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private int unreadCount;
    private String relatedCaseId;
    private String relatedRequestId;
    private String caseTrackingId;
    private String requestTrackingId;
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getParticipantId() { return participantId; }
    public void setParticipantId(String participantId) { this.participantId = participantId; }
    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }
    public String getParticipantRole() { return participantRole; }
    public void setParticipantRole(String participantRole) { this.participantRole = participantRole; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public LocalDateTime getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(LocalDateTime lastMessageTime) { this.lastMessageTime = lastMessageTime; }
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
    public String getRelatedCaseId() { return relatedCaseId; }
    public void setRelatedCaseId(String relatedCaseId) { this.relatedCaseId = relatedCaseId; }
    public String getRelatedRequestId() { return relatedRequestId; }
    public void setRelatedRequestId(String relatedRequestId) { this.relatedRequestId = relatedRequestId; }
    public String getCaseTrackingId() { return caseTrackingId; }
    public void setCaseTrackingId(String caseTrackingId) { this.caseTrackingId = caseTrackingId; }
    public String getRequestTrackingId() { return requestTrackingId; }
    public void setRequestTrackingId(String requestTrackingId) { this.requestTrackingId = requestTrackingId; }
}

