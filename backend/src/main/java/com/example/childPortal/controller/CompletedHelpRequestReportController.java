package com.example.childPortal.controller;

import com.example.childPortal.dto.CompletedHelpReportDraftRequestDTO;
import com.example.childPortal.dto.CompletedHelpReportReviewRequestDTO;
import com.example.childPortal.dto.CompletedHelpRequestReportDTO;
import com.example.childPortal.service.CompletedHelpRequestReportService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/help-requests/{requestId}/completed-report")
@CrossOrigin(origins = "*")
public class CompletedHelpRequestReportController {

    private final CompletedHelpRequestReportService reportService;

    public CompletedHelpRequestReportController(CompletedHelpRequestReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<CompletedHelpRequestReportDTO> preview(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(reportService.getReportPreview(requestId, userId));
    }

    @PutMapping("/draft")
    public ResponseEntity<CompletedHelpRequestReportDTO> saveDraft(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId,
            @RequestBody CompletedHelpReportDraftRequestDTO request
    ) {
        return ResponseEntity.ok(reportService.saveDraft(requestId, userId, request));
    }

    @PostMapping("/send-to-admin")
    public ResponseEntity<CompletedHelpRequestReportDTO> sendToAdmin(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(reportService.sendToAdmin(requestId, userId));
    }

    @PostMapping("/admin-review")
    public ResponseEntity<CompletedHelpRequestReportDTO> adminReview(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId,
            @RequestBody CompletedHelpReportReviewRequestDTO request
    ) {
        return ResponseEntity.ok(reportService.reviewByAdmin(requestId, userId, request));
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> pdf(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId
    ) {
        byte[] pdf = reportService.generatePdf(requestId, userId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("completed-help-request-report.pdf").build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
