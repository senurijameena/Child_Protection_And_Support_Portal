package com.example.childPortal.controller;

import com.example.childPortal.model.User;
import com.example.childPortal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/pending-approvals")
    public ResponseEntity<List<User>> getPendingApprovals() {
        List<User> pendingUsers = userService.getPendingApprovals();
        return ResponseEntity.ok(pendingUsers);
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

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
}
