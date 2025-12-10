package com.example.childPortal.controller;

import com.example.childPortal.dto.*;
import com.example.childPortal.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController 
@RequestMapping("/api/admin/dashboard") 
@CrossOrigin(origins = "*")
public class AdminDashboardController {

@Autowired
private AdminService adminService;

@GetMapping("/overview")
    public ResponseEntity<AdminDashboardDTO> getDashboardOverview() {
        AdminDashboardDTO dashboard = adminService.getDashboardData();
        return ResponseEntity.ok(dashboard); 
    }

@GetMapping("/cases/pending")
    public ResponseEntity<List<CaseApproveDTO>> getPendingCases() {
        List<CaseApproveDTO> cases = adminService.getPendingCases();
        return ResponseEntity.ok(cases); 
    }

@GetMapping("/cases/emergency")
    public ResponseEntity<List<CaseApproveDTO>> getEmergencyCases() {
        List<CaseApproveDTO> cases = adminService.getEmergencyCases();
        return ResponseEntity.ok(cases); 
    }

@GetMapping("/help-requests/pending")
    public ResponseEntity<List<HelpRequestApproveDTO>> getPendingHelpRequests() {
        List<HelpRequestApproveDTO> helpRequests = adminService.getPendingHelpRequests();
        return ResponseEntity.ok(helpRequests); 
    }

@GetMapping("/cases/{caseId}/approval-details")
    public ResponseEntity<CaseApproveDTO> getCaseApprovalDetails(@PathVariable String caseId) {
        CaseApproveDTO caseDetails = adminService.getCaseForApproval(caseId); 
        return caseDetails != null ?
            ResponseEntity.ok(caseDetails) :
            ResponseEntity.notFound().build();
    }

@GetMapping("/help-requests/{helpRequestId}/approval-details")
    public ResponseEntity<HelpRequestApproveDTO> getHelpRequestApprovalDetails(@PathVariable String helpRequestId) {
        HelpRequestApproveDTO helpRequestDetails = adminService.getHelpRequestForApproval(helpRequestId);
        return helpRequestDetails != null ? 
            ResponseEntity.ok(helpRequestDetails) : 
            ResponseEntity.notFound().build();
    }

@PostMapping("/cases/{caseId}/approve") 
public ResponseEntity<String> approveCase(
    @PathVariable String caseId,
    @RequestHeader("X-Admin-Id") String adminId) {
boolean approved = adminService.approveCase(caseId, adminId); return approved ?
ResponseEntity.ok("Case approved successfully") :
ResponseEntity.notFound().build(); 
}

@GetMapping("/feedback/statistics")
    public ResponseEntity<FeedbackStatisticsDTO> getFeedbackStatistics() {
        FeedbackStatisticsDTO statistics = feedbackService.getFeedbackStatistics(); 
        return ResponseEntity.ok(statistics);
}
    
@GetMapping("/feedback/recent")
    public ResponseEntity<List<FeedbackDTO>> getRecentFeedbackForDashboard() {
        List<FeedbackDTO> feedback = feedbackService.getRecentFeedback(5);
        return ResponseEntity.ok(feedback); }


@PostMapping("/cases/{caseId}/reject") 
    public ResponseEntity<String> rejectCase(
        @PathVariable String caseId,
        @RequestBody RejectRequest request, 
        @RequestHeader("X-Admin-Id") String adminId) {
        boolean rejected = adminService.rejectCase(caseId, request.getReason(), adminId); return rejected ?
            ResponseEntity.ok("Case rejected successfully") :
            ResponseEntity.notFound().build(); 
    }
    
@PostMapping("/help-requests/{helpRequestId}/approve") 
    public ResponseEntity<String> approveHelpRequest(
        @PathVariable String helpRequestId,
        @RequestHeader("X-Admin-Id") String adminId) {
        boolean approved = adminService.approveHelpRequest(helpRequestId, adminId); return approved ?
            ResponseEntity.ok("Help request approved successfully") :
            ResponseEntity.notFound().build(); }

@PostMapping("/help-requests/{helpRequestId}/reject") 
    public ResponseEntity<String> rejectHelpRequest(
        @PathVariable String helpRequestId,
        @RequestBody RejectRequest request,
        @RequestHeader("X-Admin-Id") String adminId) {
        boolean rejected = adminService.rejectHelpRequest(helpRequestId, request.getReason(), adminId);
        return rejected ?
            ResponseEntity.ok("Help request rejected successfully") : ResponseEntity.notFound().build();
    }

@PutMapping("/cases/{caseId}/priority")
public ResponseEntity<String> updateCasePriority(
@PathVariable String caseId,
@RequestParam String priority) { 
    try {
adminService.updateCasePriority(caseId, priority);
return ResponseEntity.ok("Case priority updated successfully");
 } catch (Exception e) {
return ResponseEntity.badRequest().body(e.getMessage()); 
 }
}

@PutMapping("/help-requests/{helpRequestId}/priority") 
public ResponseEntity<String> updateHelpRequestPriority(
@PathVariable String helpRequestId,
@RequestParam String priority) { 
    try {
adminService.updateHelpRequestPriority(helpRequestId, priority);
return ResponseEntity.ok("Help request priority updated successfully"); 
} catch (Exception e) {
return ResponseEntity.badRequest().body(e.getMessage()); 
}
}
public static class RejectRequest {
private String reason;
public String getReason() { return reason; }
public void setReason(String reason) { this.reason = reason; } 
}
}






