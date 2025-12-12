package com.example.childPortal.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document; 
import java.time.LocalDateTime;
@Document(collection = "transfer_requests") public class TransferRequest {
  @Id
  private String id;
  private String caseId;
  private String helpRequestId;
  private String requestedByUserId; 
  private String currentAssigneeId; 
  private String requestedAssigneeId; 
  private String transferReason;
  private TransferStatus status; private String rejectionReason;
  private String reviewedByAdminId; private LocalDateTime reviewDate;

  private LocalDateTime requestDate; private LocalDateTime responseDate;
  private LocalDateTime transferDate;

  private String notes; private boolean urgent; 
  private String priority;
  
  public enum TransferStatus {
    PENDING,
    APPROVED,
    REJECTED,
    COMPLETED, 
    CANCELLED 
}
public TransferRequest() {

  this.requestDate = LocalDateTime.now();
  this.status = TransferStatus.PENDING; 
  this.urgent = false;
  this.priority = "NORMAL";
}

  public String getId() {
    return id;
  }
  public void setId(String id) { 
    this.id = id;
  }
  public String getCaseId() { return caseId; }
  public void setCaseId(String caseId) { 
    this.caseId = caseId; 
  }
  public String getHelpRequestId() { 
    return helpRequestId; 
  }
  public void setHelpRequestId(String helpRequestId) { 
    this.helpRequestId = helpRequestId;
  }
  public String getRequestedByUserId() { 
    return requestedByUserId; 
  }
  public void setRequestedByUserId(String requestedByUserId) { 
    this.requestedByUserId = requestedByUserId;
  }
  public String getCurrentAssigneeId() {
    return currentAssigneeId; 
  }
  public void setCurrentAssigneeId(String currentAssigneeId) { 
    this.currentAssigneeId = currentAssigneeId; 
  }
  public String getRequestedAssigneeId() { 
    return requestedAssigneeId; 
  }

  public void setRequestedAssigneeId(String requestedAssigneeId) {
    this.requestedAssigneeId = requestedAssigneeId; 
  }
  public String getTransferReason() { 
    return transferReason; 
  }
  public void setTransferReason(String transferReason) {
    this.transferReason = transferReason;
  }
  public TransferStatus getStatus() { 
    return status;
  }
  public void setStatus(TransferStatus status) { 
    this.status = status;
  }
  public String getRejectionReason() { 
    return rejectionReason; 
  }
  public void setRejectionReason(String rejectionReason) {
    this.rejectionReason = rejectionReason; 
  }
  public String getReviewedByAdminId() {
    return reviewedByAdminId; 
  }
  public void setReviewedByAdminId(String reviewedByAdminId) { 
    this.reviewedByAdminId = reviewedByAdminId;
  }
  public LocalDateTime getReviewDate() {
    return reviewDate;
  }
  public void setReviewDate(LocalDateTime reviewDate) { 
    this.reviewDate = reviewDate;
  }
  public LocalDateTime getRequestDate() {
    return requestDate; 
  }
  public void setRequestDate(LocalDateTime requestDate) { 
    this.requestDate = requestDate; 
  }
  public LocalDateTime getResponseDate() {
    return responseDate; 
  }
  public void setResponseDate(LocalDateTime responseDate) { 
    this.responseDate = responseDate; 
  }

  public LocalDateTime getTransferDate() {
    return transferDate; 
  }
  public void setTransferDate(LocalDateTime transferDate) {
    this.transferDate = transferDate;
  }
  public String getNotes() { 
    return notes;
  }
  public void setNotes(String notes) { 
    this.notes = notes; 
  }
  public boolean isUrgent() {
    return urgent;
  }
  public void setUrgent(boolean urgent) { 
    this.urgent = urgent; 
  }
  public String getPriority() { 
    return priority;
  }
  public void setPriority(String priority) {
    this.priority = priority;
  } 
}
