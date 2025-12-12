package com.example.childPortal.dto;
import com.example.childPortal.model.TransferRequest.TransferStatus; 
import java.time.LocalDateTime;
public class TransferRequestDTO {
  private String id;
  private String caseId;
  private String helpRequestId;
  private String trackingId; 
  private String caseTitle; 
  private String requestedByUserId;
  private String requestedByName; 
  private String requestedByRole;
  private String currentAssigneeId; 
  private String currentAssigneeName; 
  private String currentAssigneeRole;
  private String requestedAssigneeId;
  private String requestedAssigneeName;
  private String requestedAssigneeRole;
  private String transferReason;
  private TransferStatus status;
  private String rejectionReason;

  private String reviewedByAdminId;
  private String reviewedByAdminName; 
  private LocalDateTime reviewDate;
  
  private LocalDateTime requestDate;
  private LocalDateTime responseDate; 
  private LocalDateTime transferDate;
  private String notes; 
  private boolean urgent; 
  private String priority;

  private boolean canApprove; 
  private boolean canReject; 
  private boolean canCancel; 
  private String timeSinceRequest;
  public TransferRequestDTO() {}
  public String getId() { return id; }
  public void setId(String id) { 
    this.id = id; 
  }
  public String getCaseId() { 
    return caseId; 
  }
  public void setCaseId(String caseId) { 
    this.caseId = caseId;
  }
  public String getHelpRequestId() { 
    return helpRequestId; 
  }

  public void setHelpRequestId(String helpRequestId) { 
    this.helpRequestId = helpRequestId;
  }
  public String getTrackingId() { 
    return trackingId;
  }
  public void setTrackingId(String trackingId) {
    this.trackingId = trackingId;
  }
  public String getCaseTitle() {
    return caseTitle;
  }
  public void setCaseTitle(String caseTitle) { 
    this.caseTitle = caseTitle;
  }
  public String getRequestedByUserId() {
    return requestedByUserId;
  }
  public void setRequestedByUserId(String requestedByUserId) {
    this.requestedByUserId = requestedByUserId; 
  }
  public String getRequestedByName() {
    return requestedByName;
  }
  public void setRequestedByName(String requestedByName) {
    this.requestedByName = requestedByName; 
  }
  public String getRequestedByRole() { 
    return requestedByRole;
  }
  public void setRequestedByRole(String requestedByRole) { 
    this.requestedByRole = requestedByRole; 
  }
  public String getCurrentAssigneeId() { 
    return currentAssigneeId;
  }
  public void setCurrentAssigneeId(String currentAssigneeId) { 
    this.currentAssigneeId = currentAssigneeId; 
  }
  public String getCurrentAssigneeName() { 
    return currentAssigneeName; 
  }
  public void setCurrentAssigneeName(String currentAssigneeName) { 
    this.currentAssigneeName = currentAssigneeName; 
  }

public String getCurrentAssigneeRole() { return currentAssigneeRole; }
public void setCurrentAssigneeRole(String currentAssigneeRole) { this.currentAssigneeRole = currentAssigneeRole; }
public String getRequestedAssigneeId() { return requestedAssigneeId; }
public void setRequestedAssigneeId(String requestedAssigneeId) { this.requestedAssigneeId = requestedAssigneeId; }
public String getRequestedAssigneeName() { return requestedAssigneeName; }
public void setRequestedAssigneeName(String requestedAssigneeName) { this.requestedAssigneeName = requestedAssigneeName; }
public String getRequestedAssigneeRole() { return requestedAssigneeRole; }
public void setRequestedAssigneeRole(String requestedAssigneeRole) { this.requestedAssigneeRole = requestedAssigneeRole; }
public String getTransferReason() { return transferReason; }
public void setTransferReason(String transferReason) { this.transferReason = transferReason; }
public TransferStatus getStatus() { return status; }
public void setStatus(TransferStatus status) { this.status = status; }
public String getRejectionReason() { return rejectionReason; }
public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

public String getReviewedByAdminId() { return reviewedByAdminId; }
public void setReviewedByAdminId(String reviewedByAdminId) { this.reviewedByAdminId = reviewedByAdminId; }
public String getReviewedByAdminName() { return reviewedByAdminName; }
public void setReviewedByAdminName(String reviewedByAdminName) { this.reviewedByAdminName = reviewedByAdminName; }
public LocalDateTime getReviewDate() { return reviewDate; }
public void setReviewDate(LocalDateTime reviewDate) { this.reviewDate = reviewDate; }
public LocalDateTime getRequestDate() { return requestDate; }
public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
public LocalDateTime getResponseDate() { return responseDate; }
public void setResponseDate(LocalDateTime responseDate) { this.responseDate = responseDate; }
public LocalDateTime getTransferDate() { return transferDate; }
public void setTransferDate(LocalDateTime transferDate) { this.transferDate = transferDate; }
public String getNotes() { return notes; }
public void setNotes(String notes) { this.notes = notes; }
public boolean isUrgent() { return urgent; }

public void setUrgent(boolean urgent) { this.urgent = urgent; }
public String getPriority() { return priority; }
public void setPriority(String priority) { this.priority = priority; }
public boolean isCanApprove() { return canApprove; }
public void setCanApprove(boolean canApprove) { this.canApprove = canApprove; }
public boolean isCanReject() { return canReject; }
public void setCanReject(boolean canReject) { this.canReject = canReject; }
public boolean isCanCancel() { return canCancel; }
public void setCanCancel(boolean canCancel) { this.canCancel = canCancel; }
public String getTimeSinceRequest() { return timeSinceRequest; }
public void setTimeSinceRequest(String timeSinceRequest) { this.timeSinceRequest = timeSinceRequest; }
}
