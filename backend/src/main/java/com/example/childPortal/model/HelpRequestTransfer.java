package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "help_request_transfers")
public class HelpRequestTransfer {
 @Id
 private String id;
 private String helpRequestId;
 private String currentSocialWorkerId;
 private String requestedSocialWorkerId;
 private String approvedSocialWorkerId;
 private TransferStatus status;
 private String reason;
 private LocalDateTime requestDate;
 private LocalDateTime approvedDate;
 private LocalDateTime transferDate;
 private String adminNotes;
 private boolean urgent;
  
 public enum TransferStatus {
 REQUESTED,
 APPROVED,
 REJECTED,
 COMPLETED,
 CANCELLED
 }
  
 public HelpRequestTransfer() {
 this.requestDate = LocalDateTime.now();
 this.status = TransferStatus.REQUESTED;
 }

 public String getId() { 
   return id; 
 }
 public void setId(String id) { 
   this.id = id; 
 }
 public String getHelpRequestId() { 
   return helpRequestId; 
 }
 public void setHelpRequestId(String helpRequestId) { 
   this.helpRequestId =helpRequestId; 
 }
 public String getCurrentSocialWorkerId() { 
   return currentSocialWorkerId; 
 }
 public void setCurrentSocialWorkerId(String currentSocialWorkerId) {
   this.currentSocialWorkerId = currentSocialWorkerId; 
 }
 public String getRequestedSocialWorkerId() { 
   return requestedSocialWorkerId;
 }
 public void setRequestedSocialWorkerId(String requestedSocialWorkerId) {
   this.requestedSocialWorkerId = requestedSocialWorkerId; 
 }
 public String getApprovedSocialWorkerId() {
   return approvedSocialWorkerId; 
 }
 public void setApprovedSocialWorkerId(String approvedSocialWorkerId) {
   this.approvedSocialWorkerId = approvedSocialWorkerId; 
 }
 public TransferStatus getStatus() { 
   return status; 
 }
 public void setStatus(TransferStatus status) { 
   this.status = status; 
 }
 public String getReason() { 
   return reason; 
 }
 public void setReason(String reason) { 
   this.reason = reason; 
 }
 public LocalDateTime getRequestDate() { 
   return requestDate; 
 }
 public void setRequestDate(LocalDateTime requestDate) { 
   this.requestDate = requestDate; 
 }
 public LocalDateTime getApprovedDate() { 
   return approvedDate; 
 }
 public void setApprovedDate(LocalDateTime approvedDate) { 
   this.approvedDate = approvedDate; 
 }
 public LocalDateTime getTransferDate() { 
   return transferDate;
 }
 public void setTransferDate(LocalDateTime transferDate) { 
   this.transferDate = transferDate; 
 }
 public String getAdminNotes() {
   return adminNotes; 
 }
 public void setAdminNotes(String adminNotes) { 
   this.adminNotes = adminNotes; 
 }
 public boolean isUrgent() { 
   return urgent; 
 }
 public void setUrgent(boolean urgent) { 
   this.urgent = urgent; 
 }
}
