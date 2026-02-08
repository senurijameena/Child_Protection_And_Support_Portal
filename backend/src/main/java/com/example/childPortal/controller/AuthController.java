package com.example.childPortal.controller;

import com.example.childPortal.dto.LoginRequest;
import com.example.childPortal.dto.LoginResponse;
import com.example.childPortal.dto.RegisterRequest;
import com.example.childPortal.model.Role;
import com.example.childPortal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final String UPLOAD_DIR = "uploads/registration";

    @Autowired
    private UserService userService;

    @PostMapping("/upload-document")
    public ResponseEntity<Map<String, String>> uploadDocument(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is required"));
        }
        try {
            String originalName = file.getOriginalFilename();
            if (originalName == null || originalName.isBlank()) originalName = "document";
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : "";
            String fileName = UUID.randomUUID().toString() + ext;
            Path dir = Paths.get(UPLOAD_DIR);
            Files.createDirectories(dir);
            Path target = dir.resolve(fileName);
            Files.write(target, file.getBytes());
            String url = "/" + UPLOAD_DIR + "/" + fileName;
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register/public")
    public ResponseEntity<LoginResponse> registerPublicUser(@RequestBody RegisterRequest request) {
        request.setRole(Role.PU);
        return registerUser(request);
    }

    @PostMapping("/register/police-station")
    public ResponseEntity<LoginResponse> registerPoliceStation(@RequestBody RegisterRequest request) {
        if (request.getStationName() == null || request.getStationName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Station name is required", false));
        }
        if (request.getDistrict() == null || request.getDistrict().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("District is required", false));
        }
        if (request.getCity() == null || request.getCity().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("City is required", false));
        }
        if (request.getLocationCoordinates() == null || request.getLocationCoordinates().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Station location on map is required", false));
        }
        if (request.getOfficerIdProofUrl() == null || request.getOfficerIdProofUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Officer in charge ID proof is required", false));
        }
        if (request.getGovernmentApprovalLetterUrl() == null || request.getGovernmentApprovalLetterUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Government approval letter is required", false));
        }
        request.setRole(Role.PO);
        return ResponseEntity.ok(userService.registerPoliceStation(request));
    }

    @PostMapping("/register/social-worker")
    public ResponseEntity<LoginResponse> registerSocialWorker(@RequestBody RegisterRequest request) {
        if (request.getLicenseNumber() == null || request.getLicenseNumber().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("License number is required", false));
        }
        if (request.getCertificationDocumentUrl() == null || request.getCertificationDocumentUrl().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse("Certification certificate file is required", false));
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