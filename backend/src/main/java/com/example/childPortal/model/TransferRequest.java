package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "transfer_requests")
public class TransferRequest {
    @Id
    private String id;
    
    // Entity being transferred
    private String entityId; // caseId or helpRequestId
    private String entityType; // "CASE" or "HELP_REQUEST"
    
    // Transfer details
    private String fromUserId;
    private String toUserId;
    private String reason;
    private TransferStatus status;
    
    // Timestamps
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private String processedBy;
    
    public enum TransferStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED
    }

    public TransferRequest() {
        this.requestedAt = LocalDateTime.now();
        this.status = TransferStatus.PENDING;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getFromUserId() { return fromUserId; }
    public void setFromUserId(String fromUserId) { this.fromUserId = fromUserId; }
    public String getToUserId() { return toUserId; }
    public void setToUserId(String toUserId) { this.toUserId = toUserId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public TransferStatus getStatus() { return status; }
    public void setStatus(TransferStatus status) { this.status = status; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
}