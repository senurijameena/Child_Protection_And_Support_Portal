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

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal String userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Log for debugging
        System.out.println("Fetching police stats for user: " + userId);
        
        List<CaseDTO> assignedCases = caseService.getCasesForOfficer(userId);
        
        long activeCases = assignedCases.stream()
            .filter(c -> c.getStatus() != CaseStatus.RESOLVED && c.getStatus() != CaseStatus.CLOSED)
            .count();
            
        long urgentCases = assignedCases.stream()
            .filter(c -> c.isEmergency() || (c.getPriority() != null && "URGENT".equalsIgnoreCase(c.getPriority().toString())))
            .count();
            
        long resolvedToday = 0; // Placeholder for logic requiring date comparison
        
        stats.put("assignedCases", assignedCases.size());
        stats.put("activeCases", activeCases);
        stats.put("urgentCases", urgentCases);
        stats.put("emergencyCases", urgentCases); 
        stats.put("resolvedToday", resolvedToday); 
        stats.put("avgResponse", "2.4h"); // Mock
        stats.put("pendingTransfers", 0);
        stats.put("unreadNotifications", 0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/cases")
    public ResponseEntity<List<CaseDTO>> getAssignedCases(@AuthenticationPrincipal String userId) {
        List<CaseDTO> assignedCases = caseService.getCasesForOfficer(userId);
        return ResponseEntity.ok(assignedCases);
    }
}
