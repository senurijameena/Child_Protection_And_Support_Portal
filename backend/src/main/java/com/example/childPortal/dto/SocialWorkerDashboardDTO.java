package com.example.childPortal.dto;

import java.util.List;

public class SocialWorkerDashboardDTO {
 private String socialWorkerId;
 private String socialWorkerName;
 private int totalAssignedHelpRequests;
 private int inProgressCount;
 private int completedCount;
 private int pendingStartCount;
 private int urgentCount;
 private List<HelpRequestAssignmentDTO> newAssignments;
 private List<HelpRequestAssignmentDTO> inProgressAssignments;
 private List<HelpRequestAssignmentDTO> urgentAssignments;
 private List<HelpRequestTransferDTO> pendingTransfers;
 private List<ServiceOfferDTO> recentServiceOffers;
 private List<HelpRequestDTO> highPriorityHelpRequests;
 public SocialWorkerDashboardDTO() {}
  
 public String getSocialWorkerId() {
   return socialWorkerId; 
 }
 public void setSocialWorkerId(String socialWorkerId) { 
   this.socialWorkerId = socialWorkerId; 
 }
 public String getSocialWorkerName() { 
   return socialWorkerName; 
 }
 public void setSocialWorkerName(String socialWorkerName) { 
   this.socialWorkerName = socialWorkerName; 
 }
 public int getTotalAssignedHelpRequests() { 
   return totalAssignedHelpRequests; 
 }
 public void setTotalAssignedHelpRequests(int totalAssignedHelpRequests) {
   this.totalAssignedHelpRequests = totalAssignedHelpRequests; 
 }
 public int getInProgressCount() { 
   return inProgressCount; 
 }
 public void setInProgressCount(int inProgressCount) { 
   this.inProgressCount = inProgressCount; 
 }
 public int getCompletedCount() { 
   return completedCount; 
 }
 public void setCompletedCount(int completedCount) { 
   this.completedCount = completedCount; 
 }
 public int getPendingStartCount() { 
   return pendingStartCount; 
 }
 public void setPendingStartCount(int pendingStartCount) { 
   this.pendingStartCount = pendingStartCount; 
 }
 public int getUrgentCount() { 
   return urgentCount; 
 }
 public void setUrgentCount(int urgentCount) { 
   this.urgentCount = urgentCount; 
 }
 public List<HelpRequestAssignmentDTO> getNewAssignments() { 
   return newAssignments; 
 }
 public void setNewAssignments(List<HelpRequestAssignmentDTO> newAssignments) {
   this.newAssignments = newAssignments; 
 }
 public List<HelpRequestAssignmentDTO> getInProgressAssignments() { 
   return inProgressAssignments; 
 }
 public void setInProgressAssignments(List<HelpRequestAssignmentDTO> inProgressAssignments) { 
   this.inProgressAssignments = inProgressAssignments; 
 }
 public List<HelpRequestAssignmentDTO> getUrgentAssignments() { 
   return urgentAssignments; 
 }
 public void setUrgentAssignments(List<HelpRequestAssignmentDTO> urgentAssignments) { 
   this.urgentAssignments = urgentAssignments; 
 }
 public List<HelpRequestTransferDTO> getPendingTransfers() { 
   return pendingTransfers; 
 }
 public void setPendingTransfers(List<HelpRequestTransferDTO> pendingTransfers) {
   this.pendingTransfers = pendingTransfers; 
 }
 public List<ServiceOfferDTO> getRecentServiceOffers() { 
   return recentServiceOffers;
 }
 public void setRecentServiceOffers(List<ServiceOfferDTO> recentServiceOffers) {
   this.recentServiceOffers = recentServiceOffers; 
 }
 public List<HelpRequestDTO> getHighPriorityHelpRequests() { 
   return highPriorityHelpRequests; 
 }
 public void setHighPriorityHelpRequests(List<HelpRequestDTO> highPriorityHelpRequests) {
   this.highPriorityHelpRequests = highPriorityHelpRequests; 
 }
}
