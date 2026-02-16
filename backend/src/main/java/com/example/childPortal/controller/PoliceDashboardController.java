package com.example.childPortal.controller;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.service.CaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/police/dashboard")
@CrossOrigin(origins = "*")
public class PoliceDashboardController {

    @Autowired
    private CaseService caseService;

    @Autowired
    private com.example.childPortal.service.PoliceOfficerService policeOfficerService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal String userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Demo fallback
        if (userId == null) {
            userId = "DEMO_OFFICER_001"; 
            System.out.println("Using DEMO ID for stats");
        }
        
        // Log for debugging
        System.out.println("Fetching police stats for user: " + userId);

        List<CaseDTO> assignedCases = caseService.getCasesForOfficer(userId);

        long activeCases = assignedCases.stream()
                .filter(c -> c.getStatus() != CaseStatus.RESOLVED && c.getStatus() != CaseStatus.CLOSED)
                .count();

        long urgentCases = assignedCases.stream()
                .filter(c -> c.isEmergency() || (c.getPriority() != null && "URGENT".equalsIgnoreCase(c.getPriority().toString())))
                .count();

        // Logic for Resolved Today
        java.time.LocalDate today = java.time.LocalDate.now();
        long resolvedToday = assignedCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.RESOLVED && c.getReportDate() != null)
                .count();
        
        stats.put("assignedCases", assignedCases.size());
        stats.put("activeCases", activeCases);
        stats.put("urgentCases", urgentCases);
        stats.put("emergencyCases", urgentCases); 
        stats.put("resolvedToday", resolvedToday); 
        stats.put("avgResponse", "N/A"); // Better than fake data
        stats.put("pendingTransfers", 0);
        stats.put("unreadNotifications", 0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/cases")
    public ResponseEntity<List<CaseDTO>> getAssignedCases(@AuthenticationPrincipal String userId) {
        // Demo fallback
        if (userId == null) {
            userId = "DEMO_OFFICER_001";
        }
        List<CaseDTO> assignedCases = caseService.getCasesForOfficer(userId);
        return ResponseEntity.ok(assignedCases);
    }

    @GetMapping("/station-cases")
    public ResponseEntity<List<CaseDTO>> getStationCases(@AuthenticationPrincipal String userId) {
        System.out.println("Fetching station cases for user: " + userId);

        java.util.Optional<com.example.childPortal.model.PoliceOfficer> officerOpt = policeOfficerService
                .getPoliceOfficerByUserId(userId);

        if (officerOpt.isPresent()) {
            String stationId = officerOpt.get().getStationId();
            if (stationId != null) {
                // Determine if we want ALL station cases or just unassigned ones.
                // Usually a dashboard might show "My Station's Cases"
                List<CaseDTO> stationCases = caseService.getCasesForStation(stationId);
                return ResponseEntity.ok(stationCases);
            }
        }

        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    @PostMapping("/cases/{caseId}/accept")
    public ResponseEntity<CaseDTO> acceptCase(
            @PathVariable String caseId,
            @AuthenticationPrincipal String userId) {
        CaseDTO updated = caseService.assignCaseToOfficer(caseId, userId, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PostMapping("/cases/{caseId}/decline")
    public ResponseEntity<CaseDTO> declineCase(
            @PathVariable String caseId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        String reason = body.getOrDefault("reason", "No reason provided");
        CaseDTO updated = caseService.declineCaseByOfficer(caseId, userId, reason);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}
