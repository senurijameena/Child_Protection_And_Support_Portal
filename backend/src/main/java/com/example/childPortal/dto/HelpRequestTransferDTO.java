package com.example.childPortal.dto;

import com.example.childPortal.model.HelpRequestTransfer.TransferStatus;
import java.time.LocalDateTime;

public class HelpRequestTransferDTO {
 private String id;
 private String helpRequestId;
 private String currentSocialWorkerId;
 private String currentSocialWorkerName;
 private String requestedSocialWorkerId;
 private String requestedSocialWorkerName;
 private String approvedSocialWorkerId;
 private String approvedSocialWorkerName;
 private TransferStatus status;
 private String reason;
 private LocalDateTime requestDate;
 private LocalDateTime approvedDate;
 private LocalDateTime transferDate;
 private String adminNotes;
 private boolean urgent;
 private String helpRequestTitle;
 private String helpRequestTrackingId;
 public HelpRequestTransferDTO() {}

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
   this.helpRequestId = helpRequestId; 
 }
 public String getCurrentSocialWorkerId() { 
   return currentSocialWorkerId; 
 }
 public void setCurrentSocialWorkerId(String currentSocialWorkerId) {
   this.currentSocialWorkerId = currentSocialWorkerId; 
 }
 public String getCurrentSocialWorkerName() { 
   return currentSocialWorkerName; 
 }
 public void setCurrentSocialWorkerName(String currentSocialWorkerName) {
   this.currentSocialWorkerName = currentSocialWorkerName; 
 }
 public String getRequestedSocialWorkerId() { 
   return requestedSocialWorkerId; 
 }
 public void setRequestedSocialWorkerId(String requestedSocialWorkerId) {
   this.requestedSocialWorkerId = requestedSocialWorkerId; 
 }
 public String getRequestedSocialWorkerName() { 
   return requestedSocialWorkerName; 
 }
 public void setRequestedSocialWorkerName(String requestedSocialWorkerName) {
   this.requestedSocialWorkerName = requestedSocialWorkerName; 
 }
 public String getApprovedSocialWorkerId() { 
   return approvedSocialWorkerId; 
 }
 public void setApprovedSocialWorkerId(String approvedSocialWorkerId) {
   this.approvedSocialWorkerId = approvedSocialWorkerId; 
 }
 public String getApprovedSocialWorkerName() { 
   return approvedSocialWorkerName; 
 }
 public void setApprovedSocialWorkerName(String approvedSocialWorkerName) {
   this.approvedSocialWorkerName = approvedSocialWorkerName; 
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
   this.requestDate =requestDate; 
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
 public String getHelpRequestTitle() { 
   return helpRequestTitle; 
 }
 public void setHelpRequestTitle(String helpRequestTitle) { 
   this.helpRequestTitle = helpRequestTitle; 
 }
 public String getHelpRequestTrackingId() { 
   return helpRequestTrackingId; 
 }
 public void setHelpRequestTrackingId(String helpRequestTrackingId) {
   this.helpRequestTrackingId = helpRequestTrackingId; 
 }
}
