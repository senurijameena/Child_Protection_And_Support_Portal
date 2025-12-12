package com.example.childPortal.controller;

import com.example.childPortal.model.User;
import com.example.childPortal.dto.UserManagementDTO;
import com.example.childPortal.model.PoliceOfficer;
import com.example.childPortal.model.SocialWorker;
import com.example.childPortal.service.UserService;
import com.example.childPortal.service.PoliceOfficerService;
import com.example.childPortal.service.SocialWorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.webauthn.management.UserCredentialRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private PoliceOfficerService policeOfficerService;

    @Autowired
    private SocialWorkerService socialWorkerService;

    @GetMapping("/pending-approvals")
    public ResponseEntity<List<User>> getPendingApprovals() {
        List<User> pendingUsers = userService.getPendingApprovals();
        return ResponseEntity.ok(pendingUsers);
    }

     @GetMapping("/users-by-role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    


    @GetMapping("/police-officers")
    public ResponseEntity<List<PoliceOfficer>> getAllPoliceOfficers() {
        List<PoliceOfficer> officers = policeOfficerService.getAllPoliceOfficers();
        return ResponseEntity.ok(officers);
    }

    @GetMapping("/social-workers")
    public ResponseEntity<List<SocialWorker>> getAllSocialWorkers() {
        List<SocialWorker> workers = socialWorkerService.getAllSocialWorkers();
        return ResponseEntity.ok(workers);
    }

    @GetMapping("/user-with-details/{userId}")
    public ResponseEntity<Map<String, Object>> getUserWithDetails(@PathVariable String userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);

            if (user.getRole().name().equals("PO")) {
                Optional<PoliceOfficer> officer = policeOfficerService.getPoliceOfficerByUserId(userId);
                officer.ifPresent(value -> response.put("officerDetails", value));
            } else if (user.getRole().name().equals("SW")) {
                Optional<SocialWorker> worker = socialWorkerService.getSocialWorkerByUserId(userId);
                worker.ifPresent(value -> response.put("workerDetails", value));
            }

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/approve/{userId}")
    public ResponseEntity<String> approveUser(@PathVariable String userId) {
        boolean success = userService.approveUser(userId);
        return success ? ResponseEntity.ok("User approved successfully") 
                      : ResponseEntity.badRequest().body("User not found");
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<String> rejectUser(@PathVariable String userId) {
        boolean success = userService.rejectUser(userId);
        return success ? ResponseEntity.ok("User rejected successfully") 
                      : ResponseEntity.badRequest().body("User not found");
    }


    @GetMapping("/users/search")
    public ResponseEntity<List<Object>> searchUsers(@RequestParam String query) {
    List<User> users = userService.getAllUsers(); 
    List<Object> filteredUsers = users.stream()
        .filter(user -> user.getFullName().toLowerCase().contains(query.toLowerCase()) ||user.getEmail().toLowerCase().contains(query.toLowerCase()))
        .map(user -> userService.convertToUserManagementDTO(user))
        .collect(Collectors.toList());
    return ResponseEntity.ok(filteredUsers);
}

    
    @GetMapping("/users/status/{status}")
    public ResponseEntity<List<Object>> getUsersByStatus(@PathVariable String status) {
        List<User> users = userService.getUsersByStatus(status);
        List<Object> userDTOs = users.stream()
            .map(user -> userService.convertToUserManagementDTO(user))
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

        @PostMapping("/users/bulk-approve")
    public ResponseEntity<String> bulkApproveUsers(@RequestBody List<String> userIds) {
        int approvedCount = 0;
        for (String userId : userIds) {
            if (userService.approveUser(userId)) { 
                approvedCount++;
            }
        }
        return ResponseEntity.ok("Approved " + approvedCount + " out of " + userIds.size() + " users");
    }
    
    @PostMapping("/users/bulk-reject")
    public ResponseEntity<String> bulkRejectUsers(@RequestBody BulkRejectRequest request) {
        int rejectedCount = 0;
        for (String userId : request.getUserIds()) {
            if (userService.rejectUser(userId)) { 
                rejectedCount++;
            } 
        }
        return ResponseEntity.ok("Rejected " + rejectedCount + " out of " + request.getUserIds().size() + " users");
    }
    public static class BulkRejectRequest {
        private List<String> userIds; private String reason;

        public List<String> getUserIds() { 
            return userIds; 
        }
        public void setUserIds(List<String> userIds) { 
            this.userIds = userIds; 
        }
        public String getReason() { 
            return reason;
        }
        public void setReason(String reason) { 
            this.reason = reason; 
        } 
    }

}
