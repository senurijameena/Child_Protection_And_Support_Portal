package com.example.childPortal.controller;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.dto.CaseReportRequest;
import com.example.childPortal.dto.CaseResponse;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.service.CaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    @Autowired
    private CaseService caseService;

    @GetMapping("/admin/all-details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CaseDTO>> getAllCasesWithFullDetails() {
        List<CaseDTO> cases = caseService.getAllCasesWithFullDetails();
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/public/active")
    public ResponseEntity<List<CaseDTO>> getActivePublicCases() {
        List<CaseDTO> cases = caseService.getPublicActiveCases();
        return ResponseEntity.ok(cases);
    }

    @PostMapping("/report")
    public ResponseEntity<CaseResponse> reportCase(
            @RequestBody CaseReportRequest request,
            @AuthenticationPrincipal String userId) {
        CaseResponse response = caseService.reportCase(request, userId);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/{caseId}")
    public ResponseEntity<CaseDTO> getCase(@PathVariable String caseId) {
        CaseDTO caseDTO = caseService.getCaseById(caseId);
        return caseDTO != null ? ResponseEntity.ok(caseDTO) : ResponseEntity.notFound().build();
    }

    @GetMapping("/my-cases")
    public ResponseEntity<List<CaseDTO>> getMyCases(@AuthenticationPrincipal String userId) {
        List<CaseDTO> cases = caseService.getCasesByReporter(userId);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CaseDTO>> getAllCases() {
        List<CaseDTO> cases = caseService.getAllCases();
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CaseDTO>> getCasesByStatus(@PathVariable CaseStatus status) {
        List<CaseDTO> cases = caseService.getCasesByStatus(status);
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<CaseDTO>> getCasesForStation(@PathVariable String stationId) {
        List<CaseDTO> cases = caseService.getCasesForStation(stationId);
        return ResponseEntity.ok(cases);
    }

    @PutMapping("/{caseId}/status")
    public ResponseEntity<CaseDTO> updateCaseStatus(
            @PathVariable String caseId,
            @RequestParam CaseStatus status,
            @AuthenticationPrincipal String userId) {
        CaseDTO updatedCase = caseService.updateCaseStatus(caseId, status, userId);
        return updatedCase != null ? ResponseEntity.ok(updatedCase) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{caseId}/assign/officer")
    public ResponseEntity<CaseDTO> assignToOfficer(
            @PathVariable String caseId,
            @RequestParam String officerId,
            @AuthenticationPrincipal String adminId) {
        CaseDTO updatedCase = caseService.assignCaseToOfficer(caseId, officerId, adminId);
        return updatedCase != null ? ResponseEntity.ok(updatedCase) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{caseId}/assign/station")
    public ResponseEntity<CaseDTO> assignToStation(
            @PathVariable String caseId,
            @RequestParam String stationId,
            @AuthenticationPrincipal String adminId) {
        CaseDTO updatedCase = caseService.assignCaseToStation(caseId, stationId, adminId);
        return updatedCase != null ? ResponseEntity.ok(updatedCase) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{caseId}/assign/social-worker")
    public ResponseEntity<CaseDTO> assignToSocialWorker(
            @PathVariable String caseId,
            @RequestParam String workerId,
            @AuthenticationPrincipal String adminId) {
        CaseDTO updatedCase = caseService.assignCaseToSocialWorker(caseId, workerId, adminId);
        return updatedCase != null ? ResponseEntity.ok(updatedCase) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{caseId}/evidence")
    public ResponseEntity<CaseDTO> uploadEvidence(
            @PathVariable String caseId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal String userId) {
        try {
            // Mock file storage logic
            String fileName = file.getOriginalFilename();
            String evidenceUrl = "/uploads/case_evidence/" + caseId + "/" + fileName;

            CaseDTO updatedCase = caseService.addEvidenceToCase(caseId, evidenceUrl);
            return updatedCase != null ? ResponseEntity.ok(updatedCase) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{caseId}")
    public ResponseEntity<String> deleteCase(@PathVariable String caseId) {
        boolean deleted = caseService.deleteCase(caseId);
        return deleted ? ResponseEntity.ok("Case deleted successfully") : ResponseEntity.notFound().build();
    }

}