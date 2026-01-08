package com.example.childPortal.controller;

import com.example.childPortal.model.User;
import com.example.childPortal.model.PoliceOfficer;
import com.example.childPortal.model.SocialWorker;
import com.example.childPortal.service.UserService;
import com.example.childPortal.service.PoliceOfficerService;
import com.example.childPortal.service.SocialWorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
}