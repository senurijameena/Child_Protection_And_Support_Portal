package com.example.childPortal.controller;

import com.example.childPortal.dto.CompletedHelpReportListItemDTO;
import com.example.childPortal.service.CompletedHelpRequestReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports/completed-help")
@CrossOrigin(origins = "*")
public class CompletedHelpRequestReportManagementController {

    private final CompletedHelpRequestReportService reportService;

    public CompletedHelpRequestReportManagementController(CompletedHelpRequestReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/drafts")
    public ResponseEntity<List<CompletedHelpReportListItemDTO>> getDraftReports(
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(reportService.getDraftReports(userId));
    }

    @GetMapping("/submitted")
    public ResponseEntity<List<CompletedHelpReportListItemDTO>> getSubmittedReports(
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(reportService.getSubmittedReports(userId));
    }

    @DeleteMapping("/{requestId}/draft")
    public ResponseEntity<Void> deleteDraft(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId
    ) {
        reportService.deleteDraft(requestId, userId);
        return ResponseEntity.noContent().build();
    }
}
