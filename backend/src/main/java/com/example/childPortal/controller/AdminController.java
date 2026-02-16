package com.example.childPortal.controller;

import com.example.childPortal.dto.UserManagementDTO;
import com.example.childPortal.dto.UserUpdateRequest;
import com.example.childPortal.model.Role;
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
    public ResponseEntity<List<Map<String, Object>>> getAllSocialWorkers() {
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        java.util.Set<String> processedUserIds = new java.util.HashSet<>();

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
                    map.put("registrationDate", user.getRegistrationDate());
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
                    map.put("registrationDate", user.getRegistrationDate());
                    map.put("available", user.isActive());
                    map.put("specializations", java.util.Collections.singletonList("General Social Work"));
                    map.put("organization", "Platform Registration");
                    result.add(map);
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching users by SW role: " + e.getMessage());
        }

        return ResponseEntity.ok(result);
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

    @GetMapping("/users/management")
    public ResponseEntity<List<UserManagementDTO>> getAllUsersForManagement() {
        List<UserManagementDTO> users = userService.getAllUsersForManagement();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/management/role/{role}")
    public ResponseEntity<List<UserManagementDTO>> getUsersByRoleForManagement(
            @PathVariable String role) {
        List<UserManagementDTO> users = userService.getUsersByRoleForManagement(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/with-anonymous-submissions")
    public ResponseEntity<List<UserManagementDTO>> getUsersWithAnonymousSubmissions() {
        List<UserManagementDTO> allUsers = userService.getAllUsersForManagement();
        List<UserManagementDTO> usersWithAnonymous = allUsers.stream()
                .filter(UserManagementDTO::isHasAnonymousSubmissions)
                .collect(Collectors.toList());
        return ResponseEntity.ok(usersWithAnonymous);
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> adminUpdateUser(
            @PathVariable String userId,
            @RequestBody UserUpdateRequest request) {
        boolean success = userService.updateUserDetails(userId, request);
        return success ? ResponseEntity.ok(Map.of("success", true))
                : ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
    }

    @PutMapping("/users/{userId}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateUser(@PathVariable String userId) {
        boolean success = userService.deactivateUser(userId);
        return success ? ResponseEntity.ok(Map.of("success", true))
                : ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
    }

    @PutMapping("/users/{userId}/activate")
    public ResponseEntity<Map<String, Object>> activateUser(@PathVariable String userId) {
        boolean success = userService.activateUser(userId);
        return success ? ResponseEntity.ok(Map.of("success", true))
                : ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
    }
}