package com.example.childPortal.controller;

import com.example.childPortal.dto.LoginRequest;
import com.example.childPortal.dto.LoginResponse;
import com.example.childPortal.dto.RegisterRequest;
import com.example.childPortal.model.Role;
import com.example.childPortal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register/public")
    public ResponseEntity<LoginResponse> registerPublicUser(@RequestBody RegisterRequest request) {
        request.setRole(Role.PU);
        return registerUser(request);
    }

    @PostMapping("/register/police")
    public ResponseEntity<LoginResponse> registerPoliceOfficer(@RequestBody RegisterRequest request) {
        if (request.getBadgeNumber() == null || request.getBadgeNumber().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Badge number is required", false));
        }
        if (request.getIdDocumentUrl() == null || request.getIdDocumentUrl().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("ID document is required", false));
        }
        
        request.setRole(Role.PO);
        return registerUser(request);
    }

    @PostMapping("/register/social-worker")
    public ResponseEntity<LoginResponse> registerSocialWorker(@RequestBody RegisterRequest request) {
        if (request.getLicenseNumber() == null || request.getLicenseNumber().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("License number is required", false));
        }
        if (request.getCertificationDocumentUrl() == null || request.getCertificationDocumentUrl().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Certification document is required", false));
        }
        
        request.setRole(Role.SW);
        return registerUser(request);
    }

    private ResponseEntity<LoginResponse> registerUser(RegisterRequest request) {
        if (request.getPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(new LoginResponse("Passwords do not match", false));
        }
        
        if (!request.isTermsAccepted()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Terms must be accepted", false));
        }
        
        LoginResponse response = userService.registerUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }
}