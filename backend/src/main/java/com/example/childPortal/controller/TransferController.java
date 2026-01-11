package com.example.childPortal.controller;

import com.example.childPortal.dto.TransferRequestDTO;
import com.example.childPortal.model.SocialWorker;
import com.example.childPortal.model.User;
import com.example.childPortal.service.SocialWorkerService;
import com.example.childPortal.service.TransferService;
import com.example.childPortal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/transfers")
@CrossOrigin(origins = "*")
public class TransferController {
    @Autowired
    private TransferService transferService;

    @PostMapping("/case/request")
    public ResponseEntity<TransferRequestDTO> requestCaseTransfer(
            @RequestBody CaseTransferRequest request,
            @AuthenticationPrincipal String userId) {
        TransferRequestDTO transferRequest = transferService.createCaseTransfer(
                request.getCaseId(),
                userId,
                request.getRequestedAssigneeId(),
                request.getReason());

        return ResponseEntity.ok(transferRequest);
    }

    @PostMapping("/help-request/request")
    public ResponseEntity<TransferRequestDTO> requestHelpRequestTransfer(
            @RequestBody HelpRequestTransferRequest request,
            @AuthenticationPrincipal String userId) {
        TransferRequestDTO transferRequest = transferService.createHelpRequestTransfer(
                request.getHelpRequestId(),
                userId,
                request.getRequestedAssigneeId(),
                request.getReason());

        return ResponseEntity.ok(transferRequest);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TransferRequestDTO>> getPendingTransfers() {
        List<TransferRequestDTO> transfers = transferService.getPendingTransfers();
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/urgent")
    public ResponseEntity<List<TransferRequestDTO>> getUrgentTransfers() {
        List<TransferRequestDTO> transfers = transferService.getUrgentTransferRequests();
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransferRequestDTO>> getTransfersByUser(@PathVariable String userId) {
        List<TransferRequestDTO> transfers = transferService.getTransfersByUser(userId);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<TransferRequestDTO>> getTransfersForCase(@PathVariable String caseId) {
        List<TransferRequestDTO> transfers = transferService.getTransfersForEntity(caseId);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/help-request/{helpRequestId}")
    public ResponseEntity<List<TransferRequestDTO>> getTransfersForHelpRequest(@PathVariable String helpRequestId) {
        List<TransferRequestDTO> transfers = transferService.getTransfersForEntity(helpRequestId);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/{transferId}")
    public ResponseEntity<TransferRequestDTO> getTransferRequest(@PathVariable String transferId) {
        TransferRequestDTO transfer = transferService.getTransferRequest(transferId);
        return transfer != null ? ResponseEntity.ok(transfer) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{transferId}/approve")
    public ResponseEntity<TransferRequestDTO> approveTransfer(
            @PathVariable String transferId,
            @AuthenticationPrincipal String adminId) {
        TransferRequestDTO approvedTransfer = transferService.approveTransfer(transferId, adminId);
        return approvedTransfer != null ? ResponseEntity.ok(approvedTransfer) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{transferId}/reject")
    public ResponseEntity<TransferRequestDTO> rejectTransfer(
            @PathVariable String transferId,
            @RequestBody RejectRequest request,
            @AuthenticationPrincipal String adminId) {
        TransferRequestDTO rejectedTransfer = transferService.rejectTransfer(transferId, adminId, request.getReason());
        return rejectedTransfer != null ? ResponseEntity.ok(rejectedTransfer) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{transferId}/cancel")
    public ResponseEntity<TransferRequestDTO> cancelTransfer(
            @PathVariable String transferId,
            @AuthenticationPrincipal String userId) {
        TransferRequestDTO cancelledTransfer = transferService.cancelTransfer(transferId, userId);
        return cancelledTransfer != null ? ResponseEntity.ok(cancelledTransfer) : ResponseEntity.notFound().build();
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
        return executed ? ResponseEntity.ok("Transfer executed successfully")
                : ResponseEntity.badRequest().body("Failed to execute transfer");
    }

    public static class CaseTransferRequest {
        private String caseId;
        private String requestedAssigneeId;
        private String reason;

        public String getCaseId() {
            return caseId;
        }

        public void setCaseId(String caseId) {
            this.caseId = caseId;
        }

        public String getRequestedAssigneeId() {
            return requestedAssigneeId;
        }

        public void setRequestedAssigneeId(String requestedAssigneeId) {
            this.requestedAssigneeId = requestedAssigneeId;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    public static class HelpRequestTransferRequest {
        private String helpRequestId;
        private String requestedAssigneeId;
        private String reason;

        public String getHelpRequestId() {
            return helpRequestId;
        }

        public void setHelpRequestId(String helpRequestId) {
            this.helpRequestId = helpRequestId;
        }

        public String getRequestedAssigneeId() {
            return requestedAssigneeId;
        }

        public void setRequestedAssigneeId(String requestedAssigneeId) {
            this.requestedAssigneeId = requestedAssigneeId;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    @Autowired
    private UserService userService;

    @Autowired
    private SocialWorkerService socialWorkerService;

    @GetMapping("/available-social-workers")
    public ResponseEntity<List<Map<String, Object>>> getAvailableSocialWorkers() {
        List<Map<String, Object>> result = new ArrayList<>();
        Set<String> processedUserIds = new HashSet<>();

        // 1. Fetch all social worker profiles
        try {
            List<SocialWorker> profiles = socialWorkerService.getAllSocialWorkers();
            for (SocialWorker profile : profiles) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", profile.getId());
                map.put("userId", profile.getUserId());
                map.put("specializations", profile.getSpecializations());
                map.put("organization", profile.getOrganization());
                map.put("available", profile.isAvailable());

                Optional<User> userOpt = userService.getUserById(profile.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    map.put("fullName", user.getFullName());
                    map.put("email", user.getEmail());
                    map.put("phone", user.getPhone());
                    processedUserIds.add(user.getId());
                } else {
                    map.put("fullName", "Worker " + profile.getId().substring(0, 5));
                }
                result.add(map);
            }
        } catch (Exception e) {
            System.err.println("Error fetching social worker profiles: " + e.getMessage());
        }

        // 2. Fetch all users with SW role to catch those without profiles
        try {
            List<User> swUsers = userService.getUsersByRole("SW");
            for (User user : swUsers) {
                if (!processedUserIds.contains(user.getId())) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("userId", user.getId());
                    map.put("id", "USER-" + user.getId()); // Use userId as id fallback
                    map.put("fullName", user.getFullName());
                    map.put("email", user.getEmail());
                    map.put("phone", user.getPhone());
                    map.put("available", user.isActive());
                    map.put("specializations", Collections.singletonList("General Social Work"));
                    map.put("organization", "Platform Registration");
                    result.add(map);
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching users by SW role: " + e.getMessage());
        }

        return ResponseEntity.ok(result);
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
}