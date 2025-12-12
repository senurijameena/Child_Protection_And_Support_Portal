package com.example.childPortal.controller;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.dto.CaseReportRequest;
import com.example.childPortal.dto.CaseResponse;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.service.CaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cases")
@CrossOrigin(origins = "*")
public class CaseController {

    @Autowired
    private CaseService caseService;

    @PostMapping("/report")
    public ResponseEntity<CaseResponse> reportCase(@RequestBody CaseReportRequest request) {
        CaseResponse response = caseService.reportCase(request);
        return response.isSuccess() ? 
            ResponseEntity.ok(response) : 
            ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/{caseId}")
    public ResponseEntity<CaseDTO> getCase(@PathVariable String caseId) {
        CaseDTO caseDTO = caseService.getCaseById(caseId);
        return caseDTO != null ? 
            ResponseEntity.ok(caseDTO) : 
            ResponseEntity.notFound().build();
    }

    @GetMapping("/my-cases")
    public ResponseEntity<List<CaseDTO>> getMyCases(@RequestParam String userId) {
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

    @PutMapping("/{caseId}/status")
    public ResponseEntity<CaseDTO> updateCaseStatus(@PathVariable String caseId, @RequestParam CaseStatus status) {
        CaseDTO updatedCase = caseService.updateCaseStatus(caseId, status);
        return updatedCase != null ? 
            ResponseEntity.ok(updatedCase) : 
            ResponseEntity.notFound().build();
    }

    @PutMapping("/{caseId}/assign/officer")
    public ResponseEntity<CaseDTO> assignToOfficer(@PathVariable String caseId, @RequestParam String officerId) {
        CaseDTO updatedCase = caseService.assignCaseToOfficer(caseId, officerId);
        return updatedCase != null ? 
            ResponseEntity.ok(updatedCase) : 
            ResponseEntity.notFound().build();
    }

    @PutMapping("/{caseId}/assign/social-worker")
    public ResponseEntity<CaseDTO> assignToSocialWorker(@PathVariable String caseId, @RequestParam String workerId) {
        CaseDTO updatedCase = caseService.assignCaseToSocialWorker(caseId, workerId);
        return updatedCase != null ? 
            ResponseEntity.ok(updatedCase) : 
            ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{caseId}")
    public ResponseEntity<String> deleteCase(@PathVariable String caseId) {
        boolean deleted = caseService.deleteCase(caseId);
        return deleted ? 
            ResponseEntity.ok("Case deleted successfully") : 
            ResponseEntity.notFound().build();
    }
}