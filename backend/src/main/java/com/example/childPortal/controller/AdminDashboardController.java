package com.example.childPortal.controller;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.UserUpdateRequest;
import com.example.childPortal.service.AdminService;
import com.example.childPortal.service.FeedbackService;
import com.example.childPortal.service.UserService;
import com.example.childPortal.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController 
@RequestMapping("/api/admin/dashboard") 
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private FeedbackService feedbackService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private TransferService transferService;

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
        boolean approved = adminService.approveCase(caseId, adminId); 
        return approved ?
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
        return ResponseEntity.ok(feedback); 
    }

    @PostMapping("/cases/{caseId}/reject") 
    public ResponseEntity<String> rejectCase(
        @PathVariable String caseId,
        @RequestBody RejectRequest request, 
        @RequestHeader("X-Admin-Id") String adminId) {
        boolean rejected = adminService.rejectCase(caseId, request.getReason(), adminId); 
        return rejected ?
            ResponseEntity.ok("Case rejected successfully") :
            ResponseEntity.notFound().build(); 
    }
    
    @PostMapping("/help-requests/{helpRequestId}/approve") 
    public ResponseEntity<String> approveHelpRequest(
        @PathVariable String helpRequestId,
        @RequestHeader("X-Admin-Id") String adminId) {
        boolean approved = adminService.approveHelpRequest(helpRequestId, adminId); 
        return approved ?
            ResponseEntity.ok("Help request approved successfully") :
            ResponseEntity.notFound().build(); 
    }

    @PostMapping("/help-requests/{helpRequestId}/reject") 
    public ResponseEntity<String> rejectHelpRequest(
        @PathVariable String helpRequestId,
        @RequestBody RejectRequest request,
        @RequestHeader("X-Admin-Id") String adminId) {
        boolean rejected = adminService.rejectHelpRequest(helpRequestId, request.getReason(), adminId);
        return rejected ?
            ResponseEntity.ok("Help request rejected successfully") : 
            ResponseEntity.notFound().build();
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

    @GetMapping("/users")
    public ResponseEntity<List<UserManagementDTO>> getAllUsers() {
        List<UserManagementDTO> users = userService.getAllUsersForManagement();
        return ResponseEntity.ok(users); 
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserManagementDTO>> getUsersByRole(@PathVariable String role) {
        List<UserManagementDTO> users = userService.getUsersByRoleForManagement(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/active")
    public ResponseEntity<List<UserManagementDTO>> getActiveUsers() {
        List<UserManagementDTO> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }
      
    @GetMapping("/users/inactive")
    public ResponseEntity<List<UserManagementDTO>> getInactiveUsers() {
        List<UserManagementDTO> users = userService.getInactiveUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserManagementDTO> getUserDetails(@PathVariable String userId) {
        UserManagementDTO user = userService.getUserForManagement(userId); 
        return user != null ?
            ResponseEntity.ok(user) :
            ResponseEntity.notFound().build(); 
    }

    @PostMapping("/users/{userId}/deactivate") 
    public ResponseEntity<String> deactivateUser(
        @PathVariable String userId,
        @RequestBody DeactivateRequest request) {
        boolean deactivated = userService.deactivateUser(userId, request.getReason()); 
        return deactivated ?
            ResponseEntity.ok("User deactivated successfully") :
            ResponseEntity.notFound().build(); 
    }

    @PostMapping("/users/{userId}/activate")
    public ResponseEntity<String> activateUser(@PathVariable String userId) {
        boolean activated = userService.activateUser(userId); 
        return activated ?
            ResponseEntity.ok("User activated successfully") :
            ResponseEntity.notFound().build(); 
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<String> updateUser(
        @PathVariable String userId,
        @RequestBody UserUpdateRequest updateRequest) { 
        try {
            boolean updated = userService.updateUserDetails(userId, updateRequest); 
            return updated ?
                ResponseEntity.ok("User updated successfully") :
                ResponseEntity.notFound().build(); 
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users/statistics")
    public ResponseEntity<Map<String, Long>> getUserStatistics() {
        Map<String, Long> statistics = userService.getUserStatistics(); 
        return ResponseEntity.ok(statistics); 
    }

    @GetMapping("/transfers") 
    public ResponseEntity<List<TransferRequestDTO>> getAllTransferRequests() { 
        List<TransferRequestDTO> transfers = transferService.getPendingTransferRequests(); 
        return ResponseEntity.ok(transfers); 
    } 

    @GetMapping("/transfers/statistics") 
    public ResponseEntity<TransferStatistics> getTransferStatistics() { 
        TransferStatistics stats = new TransferStatistics(); 
        
        stats.setPendingTransfers(transferService.getPendingTransferCount()); 
        stats.setUrgentTransfers(transferService.getUrgentTransferRequests().size()); 
        
        return ResponseEntity.ok(stats); 
    } 

    public static class RejectRequest {
        private String reason;
        public String getReason() { 
            return reason;
        }
        public void setReason(String reason) { 
            this.reason = reason;
        } 
    }
    
    public static class DeactivateRequest {
        private String reason;
        public String getReason() { 
            return reason;
        }
        public void setReason(String reason) { 
            this.reason = reason;
        } 
    }
    
    public static class TransferStatistics { 
        private long pendingTransfers; 
        private long urgentTransfers; 
        private long caseTransfers; 
        private long helpRequestTransfers; 
        private long approvedThisWeek; 
        private long rejectedThisWeek; 

        public long getPendingTransfers() { 
            return pendingTransfers;
        } 
        public void setPendingTransfers(long pendingTransfers) {
            this.pendingTransfers = pendingTransfers; 
        } 

        public long getUrgentTransfers() {
            return urgentTransfers; 
        } 
        public void setUrgentTransfers(long urgentTransfers) {
            this.urgentTransfers = urgentTransfers;
        } 

        public long getCaseTransfers() {
            return caseTransfers; 
        } 
        public void setCaseTransfers(long caseTransfers) {
            this.caseTransfers = caseTransfers; 
        } 

        public long getHelpRequestTransfers() {
            return helpRequestTransfers;
        } 
        public void setHelpRequestTransfers(long helpRequestTransfers) { 
            this.helpRequestTransfers = helpRequestTransfers; 
        } 

        public long getApprovedThisWeek() { 
            return approvedThisWeek;
        } 
        public void setApprovedThisWeek(long approvedThisWeek) { 
            this.approvedThisWeek = approvedThisWeek; 
        } 

        public long getRejectedThisWeek() {
            return rejectedThisWeek; 
        } 
        public void setRejectedThisWeek(long rejectedThisWeek) { 
            this.rejectedThisWeek = rejectedThisWeek; 
        } 
    } 
}