package com.example.childPortal.controller;

import com.example.childPortal.dto.AnonymityStatsDTO;
import com.example.childPortal.dto.ConversionRequestDTO;
import com.example.childPortal.service.AnonymityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/anonymity")
@CrossOrigin(origins = "*")
public class AnonymityController {

    @Autowired
    private AnonymityService anonymityService;

    @GetMapping("/stats")
    public ResponseEntity<AnonymityStatsDTO> getAnonymityStats(@AuthenticationPrincipal String userId) {
        AnonymityStatsDTO stats = anonymityService.getAnonymityStats(userId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/case/{caseId}/convert-to-anonymous")
    public ResponseEntity<String> convertCaseToAnonymous(
            @PathVariable String caseId,
            @AuthenticationPrincipal String userId) {
        boolean success = anonymityService.convertCaseToAnonymous(caseId, userId);
        return success ? 
            ResponseEntity.ok("Case converted to anonymous successfully") : 
            ResponseEntity.badRequest().body("Failed to convert case");
    }

    @PostMapping("/case/{caseId}/convert-to-registered")
    public ResponseEntity<String> convertCaseToRegistered(
            @PathVariable String caseId,
            @RequestBody ConversionRequestDTO request,
            @AuthenticationPrincipal String userId) {
        boolean success = anonymityService.convertCaseToRegistered(caseId, userId, request);
        return success ? 
            ResponseEntity.ok("Case converted to registered successfully") : 
            ResponseEntity.badRequest().body("Failed to convert case");
    }

    @PostMapping("/help-request/{requestId}/convert-to-anonymous")
    public ResponseEntity<String> convertHelpRequestToAnonymous(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId) {
        boolean success = anonymityService.convertHelpRequestToAnonymous(requestId, userId);
        return success ? 
            ResponseEntity.ok("Help request converted to anonymous successfully") : 
            ResponseEntity.badRequest().body("Failed to convert help request");
    }

    @PostMapping("/help-request/{requestId}/convert-to-registered")
    public ResponseEntity<String> convertHelpRequestToRegistered(
            @PathVariable String requestId,
            @RequestBody ConversionRequestDTO request,
            @AuthenticationPrincipal String userId) {
        boolean success = anonymityService.convertHelpRequestToRegistered(requestId, userId, request);
        return success ? 
            ResponseEntity.ok("Help request converted to registered successfully") : 
            ResponseEntity.badRequest().body("Failed to convert help request");
    }
}

