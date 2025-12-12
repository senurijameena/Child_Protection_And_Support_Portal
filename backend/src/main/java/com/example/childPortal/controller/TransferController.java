package com.example.childPortal.controller; 

import com.example.childPortal.dto.TransferRequestDTO; 
import com.example.childPortal.service.TransferService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*; 
import java.util.List; 

@RestController 
@RequestMapping("/api/transfers") 
@CrossOrigin(origins = "*") 
public class TransferController { 
  @Autowired 
  private TransferService transferService; 

  @PostMapping("/case/request") 
  public ResponseEntity<TransferRequestDTO> requestCaseTransfer(@RequestBody CaseTransferRequest request) { 
    TransferRequestDTO transferRequest = transferService.createCaseTransferRequest( 
            request.getCaseId(), 
            request.getRequestedAssigneeId(), 
            request.getReason()
        ); 
         
        return ResponseEntity.ok(transferRequest); 
    } 
 
    @PostMapping("/help-request/request") 
    public ResponseEntity<TransferRequestDTO> requestHelpRequestTransfer(@RequestBody HelpRequestTransferRequest request) { 
        TransferRequestDTO transferRequest = transferService.createHelpRequestTransferRequest( 
            request.getHelpRequestId(), 
            request.getRequestedAssigneeId(), 
            request.getReason()
        ); 
         
        return ResponseEntity.ok(transferRequest); 
    } 
 
    @GetMapping("/pending") 
    public ResponseEntity<List<TransferRequestDTO>> getPendingTransfers() { 
        List<TransferRequestDTO> transfers = transferService.getPendingTransferRequests(); 
        return ResponseEntity.ok(transfers); 
    } 

    @GetMapping("/urgent") 
    public ResponseEntity<List<TransferRequestDTO>> getUrgentTransfers() { 
        List<TransferRequestDTO> transfers = transferService.getUrgentTransferRequests(); 
        return ResponseEntity.ok(transfers); 
    } 
 
    @GetMapping("/user/{userId}") 
    public ResponseEntity<List<TransferRequestDTO>> getTransfersByUser(@PathVariable String userId) { 
        List<TransferRequestDTO> transfers = transferService.getTransferRequestsByUser(userId); 
        return ResponseEntity.ok(transfers); 
    } 
 
    @GetMapping("/case/{caseId}") 
    public ResponseEntity<List<TransferRequestDTO>> getTransfersForCase(@PathVariable String caseId) { 
        List<TransferRequestDTO> transfers = transferService.getTransferRequestsForCase(caseId); 
        return ResponseEntity.ok(transfers); 
    } 

    @GetMapping("/help-request/{helpRequestId}") 
    public ResponseEntity<List<TransferRequestDTO>> getTransfersForHelpRequest(@PathVariable String helpRequestId) { 
        List<TransferRequestDTO> transfers = transferService.getTransferRequestsForHelpRequest(helpRequestId); 
        return ResponseEntity.ok(transfers); 
    } 

    @GetMapping("/{transferId}") 
    public ResponseEntity<TransferRequestDTO> getTransferRequest(@PathVariable String transferId) { 
        TransferRequestDTO transfer = transferService.getTransferRequest(transferId); 
        return transfer != null ?  
            ResponseEntity.ok(transfer) :  
            ResponseEntity.notFound().build(); 
    } 

    @PostMapping("/{transferId}/approve") 
    public ResponseEntity<TransferRequestDTO> approveTransfer(@PathVariable String transferId) { 
        TransferRequestDTO approvedTransfer = transferService.approveTransferRequest(transferId); 
        return approvedTransfer != null ?  
            ResponseEntity.ok(approvedTransfer) :  
            ResponseEntity.notFound().build(); 
    } 

    @PostMapping("/{transferId}/reject") 
    public ResponseEntity<TransferRequestDTO> rejectTransfer(@PathVariable String transferId, @RequestBody RejectRequest request) { 
        TransferRequestDTO rejectedTransfer = transferService.rejectTransferRequest(transferId, request.getReason()); 
        return rejectedTransfer != null ?  
            ResponseEntity.ok(rejectedTransfer) :  
            ResponseEntity.notFound().build(); 
    } 
  
    @PostMapping("/{transferId}/cancel") 
    public ResponseEntity<TransferRequestDTO> cancelTransfer(@PathVariable String transferId) { 
        TransferRequestDTO cancelledTransfer = transferService.cancelTransferRequest(transferId); 
        return cancelledTransfer != null ?  
            ResponseEntity.ok(cancelledTransfer) :  
            ResponseEntity.notFound().build(); 
    } 
 
    @GetMapping("/user/{userId}/history") 
    public ResponseEntity<List<TransferRequestDTO>> getTransferHistory(@PathVariable String userId) { 
        List<TransferRequestDTO> history = transferService.getTransferHistory(userId); 
        return ResponseEntity.ok(history); 
    } 

    @GetMapping("/count/pending") 
    public ResponseEntity<Long> getPendingTransferCount() { 
        long count = transferService.getPendingTransferCount(); 
        return ResponseEntity.ok(count); 
    } 

    @PostMapping("/{transferId}/execute") 
    public ResponseEntity<String> executeTransfer(@PathVariable String transferId) { 
        boolean executed = transferService.executeTransfer(transferId); 
        return executed ?  
            ResponseEntity.ok("Transfer executed successfully") :  
            ResponseEntity.badRequest().body("Failed to execute transfer"); 
    } 
 
    public static class CaseTransferRequest { 
        private String caseId; 
        private String requestedAssigneeId; 
        private String reason; 

        public String getCaseId() { return caseId; } 
        public void setCaseId(String caseId) { this.caseId = caseId; } 
        public String getRequestedAssigneeId() { return requestedAssigneeId; } 
        public void setRequestedAssigneeId(String requestedAssigneeId) { this.requestedAssigneeId = requestedAssigneeId; } 
        public String getReason() { return reason; } 
        public void setReason(String reason) { this.reason = reason; } 
    } 
 
    public static class HelpRequestTransferRequest { 
        private String helpRequestId; 
        private String requestedAssigneeId; 
        private String reason; 

        public String getHelpRequestId() { return helpRequestId; } 
        public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; } 
        public String getRequestedAssigneeId() { return requestedAssigneeId; } 
        public void setRequestedAssigneeId(String requestedAssigneeId) { this.requestedAssigneeId = requestedAssigneeId; } 
        public String getReason() { return reason; } 
        public void setReason(String reason) { this.reason = reason; } 
    } 

    public static class RejectRequest { 
        private String reason; 
        public String getReason() { return reason; } 
        public void setReason(String reason) { this.reason = reason; } 
    } 
}