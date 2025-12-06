package com.example.childPortal.controller;

import com.example.childPortal.dto.HelpRequestAssignmentDTO;
import com.example.childPortal.dto.HelpRequestTransferDTO;
import com.example.childPortal.dto.SocialWorkerDashboardDTO;
import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.model.HelpRequestAssignment.AssignmentStatus;
import com.example.childPortal.service.HelpAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/social-worker")
@CrossOrigin(origins = "*")
public class SocialWorkerController {
 @Autowired
 private HelpAssignmentService helpAssignmentService;
 @GetMapping("/dashboard/{socialWorkerId}")
 public ResponseEntity<SocialWorkerDashboardDTO> getDashboard(@PathVariable String socialWorkerId) {
   SocialWorkerDashboardDTO dashboard = helpAssignmentService.getSocialWorkerDashboard(socialWorkerId);
   return ResponseEntity.ok(dashboard);
 }

 @PostMapping("/assign/{helpRequestId}")
 public ResponseEntity<HelpRequestAssignmentDTO> assignHelpRequest(
   @PathVariable String helpRequestId,
   @RequestParam String socialWorkerId) {
   HelpRequestAssignmentDTO assignment = helpAssignmentService.assignHelpRequest(helpRequestId, socialWorkerId);
   return assignment != null ?
     ResponseEntity.ok(assignment) :
     ResponseEntity.badRequest().build();
 }

 @PostMapping("/start/{helpRequestId}")
 public ResponseEntity<HelpRequestAssignmentDTO> startWorkingOnHelpRequest(
 @PathVariable String helpRequestId,
 @RequestBody StartWorkRequest request) {
   HelpRequestAssignmentDTO assignment = helpAssignmentService.startWorkingOnHelpRequest(
     helpRequestId, request.getSocialWorkerId(), request.getInitialNotes());
   return assignment != null ?
     ResponseEntity.ok(assignment) :
     ResponseEntity.badRequest().build();
 }

 @PostMapping("/complete/{helpRequestId}")
 public ResponseEntity<HelpRequestAssignmentDTO> completeHelpRequest(
 @PathVariable String helpRequestId,
 @RequestBody CompleteRequest request) {
   HelpRequestAssignmentDTO assignment = helpAssignmentService.completeHelpRequest(
     helpRequestId, request.getSocialWorkerId(), request.getCompletionNotes());
   return assignment != null ?
     ResponseEntity.ok(assignment) :
     ResponseEntity.badRequest().build();
 }

 @PostMapping("/transfer/request")
 public ResponseEntity<HelpRequestTransferDTO> requestTransfer(
 @RequestBody TransferRequest request) {
   HelpRequestTransferDTO transfer = helpAssignmentService.requestTransfer(
     request.getHelpRequestId(),
     request.getCurrentWorkerId(),
     request.getRequestedWorkerId(),
     request.getReason());
   return transfer != null ?
     ResponseEntity.ok(transfer) :
     ResponseEntity.badRequest().build();
 }

 @PostMapping("/transfer/{transferId}/approve")
 public ResponseEntity<HelpRequestTransferDTO> approveTransfer(
 @PathVariable String transferId,
 @RequestBody ApproveTransferRequest request) {
   HelpRequestTransferDTO transfer = helpAssignmentService.approveTransfer(
     transferId, request.getApprovingWorkerId(), request.getNotes());
   return transfer != null ?
     ResponseEntity.ok(transfer) :
     ResponseEntity.badRequest().build();
 }

 @PostMapping("/transfer/{transferId}/reject")
 public ResponseEntity<HelpRequestTransferDTO> rejectTransfer(
 @PathVariable String transferId,
 @RequestBody RejectTransferRequest request) {
   HelpRequestTransferDTO transfer = helpAssignmentService.rejectTransfer
     transferId, request.getRejectingWorkerId(), request.getReason());
   return transfer != null ?
     ResponseEntity.ok(transfer) :
     ResponseEntity.badRequest().build();
 }

 @GetMapping("/{socialWorkerId}/assignments")
 public ResponseEntity<List<HelpRequestAssignmentDTO>> getAssignments(
 @PathVariable String socialWorkerId) {
   List<HelpRequestAssignmentDTO> assignments = helpAssignmentService.getAssignmentsBySocialWorker(socialWorkerId);
   return ResponseEntity.ok(assignments);
 }

 @GetMapping("/{socialWorkerId}/assignments/new")
 public ResponseEntity<List<HelpRequestAssignmentDTO>> getNewAssignments(
 @PathVariable String socialWorkerId) {
   List<HelpRequestAssignmentDTO> assignments = helpAssignmentService.getNewAssignments(socialWorkerId);
   return ResponseEntity.ok(assignments);
 }

 @GetMapping("/{socialWorkerId}/assignments/urgent")
 public ResponseEntity<List<HelpRequestAssignmentDTO>> getUrgentAssignments(
 @PathVariable String socialWorkerId) {
   List<HelpRequestAssignmentDTO> assignments = helpAssignmentService.getUrgentAssignments(socialWorkerId);
   return ResponseEntity.ok(assignments);
 }

 @GetMapping("/{socialWorkerId}/transfers/pending")
 public ResponseEntity<List<HelpRequestTransferDTO>> getPendingTransfers(
 @PathVariable String socialWorkerId) {
   List<HelpRequestTransferDTO> transfers = helpAssignmentService.getPendingTransfers(socialWorkerId);
   return ResponseEntity.ok(transfers);
 }

 @GetMapping("/{socialWorkerId}/transfers/history")
 public ResponseEntity<List<HelpRequestTransferDTO>> getTransferHistory(
 @PathVariable String socialWorkerId) {
   List<HelpRequestTransferDTO> transfers = helpAssignmentService.getTransferHistory(socialWorkerId);
   return ResponseEntity.ok(transfers);
 }

 @PostMapping("/{helpRequestId}/notes")
 public ResponseEntity<HelpRequestDTO> addNotes(
 @PathVariable String helpRequestId,
 @RequestBody AddNotesRequest request) {
   HelpRequestDTO updatedRequest = helpAssignmentService.addNotesToHelpRequest(
     helpRequestId, request.getNotes(), request.getSocialWorkerId());
   return updatedRequest != null ?
     ResponseEntity.ok(updatedRequest) :
     ResponseEntity.badRequest().build();
 }
  
 @PutMapping("/{helpRequestId}/priority")
 public ResponseEntity<HelpRequestDTO> updatePriority(
 @PathVariable String helpRequestId,
 @RequestBody UpdatePriorityRequest request) {
   HelpRequestDTO updatedRequest = helpAssignmentService.updateHelpRequestPriority(
     helpRequestId, request.getPriority(), request.getSocialWorkerId());
   return updatedRequest != null ?
     ResponseEntity.ok(updatedRequest) :
     ResponseEntity.badRequest().build();
 }

 public static class StartWorkRequest {
   private String socialWorkerId;
   private String initialNotes;
   public String getSocialWorkerId() { 
     return socialWorkerId; 
   }
   public void setSocialWorkerId(String socialWorkerId) {
     this.socialWorkerId = socialWorkerId; 
   }
   public String getInitialNotes() { 
     return initialNotes; 
   }
   public void setInitialNotes(String initialNotes) { 
     this.initialNotes = initialNotes; 
   }
 }
 public static class CompleteRequest {
   private String socialWorkerId;
   private String completionNotes;
   public String getSocialWorkerId() { 
     return socialWorkerId; 
 }
 public void setSocialWorkerId(String socialWorkerId) {
   this.socialWorkerId = socialWorkerId; 
 }
 public String getCompletionNotes() { 
   return completionNotes; 
 }
 public void setCompletionNotes(String completionNotes) { 
   this.completionNotes = completionNotes; 
 }
 }
 public static class TransferRequest {
   private String helpRequestId;
   private String currentWorkerId;
   private String requestedWorkerId;
   private String reason;
   public String getHelpRequestId() {
     return helpRequestId; 
   }
   public void setHelpRequestId(String helpRequestId) { 
     this.helpRequestId = helpRequestId; 
   }
   public String getCurrentWorkerId() { 
     return currentWorkerId; 
   }
   public void setCurrentWorkerId(String currentWorkerId) { 
     this.currentWorkerId = currentWorkerId; 
   }
   public String getRequestedWorkerId() { 
     return requestedWorkerId; 
   }
   public void setRequestedWorkerId(String requestedWorkerId) { 
     this.requestedWorkerId = requestedWorkerId; 
   }
   public String getReason() { 
     return reason; 
   }
   public void setReason(String reason) { 
     this.reason = reason; 
   }
 }
 public static class ApproveTransferRequest {
   private String approvingWorkerId;
   private String notes;
   public String getApprovingWorkerId() { return approvingWorkerId; }
   public void setApprovingWorkerId(String approvingWorkerId) { this.approvingWorkerId = approvingWorkerId; }
   public String getNotes() { return notes; }
   public void setNotes(String notes) { this.notes = notes; }
 }
  
 public static class RejectTransferRequest {
   private String rejectingWorkerId;
   private String reason;
   public String getRejectingWorkerId() { 
     return rejectingWorkerId; 
   }
   public void setRejectingWorkerId(String rejectingWorkerId) { 
     this.rejectingWorkerId = rejectingWorkerId; 
   }
   public String getReason() { 
     return reason; 
   }
   public void setReason(String reason) { 
     this.reason = reason; 
   }
 }
 public static class AddNotesRequest {
   private String socialWorkerId;
   private String notes;
   public String getSocialWorkerId() { 
     return socialWorkerId; 
   }
   public void setSocialWorkerId(String socialWorkerId) { 
     this.socialWorkerId = socialWorkerId; 
   }
   public String getNotes() { 
     return notes; 
   }
   public void setNotes(String notes) { 
     this.notes = notes; 
   }
 }
 public static class UpdatePriorityRequest {
   private String socialWorkerId;
   private String priority;
   public String getSocialWorkerId() { 
     return socialWorkerId; 
   }
   public void setSocialWorkerId(String socialWorkerId) { 
     this.socialWorkerId = socialWorkerId; 
   }
   public String getPriority() { 
     return priority; 
   }
   public void setPriority(String priority) { 
     this.priority = priority; 
   }
 }
}
