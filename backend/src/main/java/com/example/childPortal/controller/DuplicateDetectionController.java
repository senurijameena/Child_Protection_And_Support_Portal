package com.example.childPortal.controller;

import com.example.childPortal.dto.DuplicateDetectionDTO;
import com.example.childPortal.service.DuplicateDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/duplicates")
@CrossOrigin(origins = "*")
public class DuplicateDetectionController {

    @Autowired
    private DuplicateDetectionService duplicateDetectionService;

    @GetMapping("/cases/{caseId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PO', 'ROLE_SW', 'ROLE_ADMIN')")
    public ResponseEntity<List<DuplicateDetectionDTO>> findDuplicateCases(@PathVariable String caseId) {
        List<DuplicateDetectionDTO> duplicates = duplicateDetectionService.findDuplicateCases(caseId);
        return ResponseEntity.ok(duplicates);
    }

    @GetMapping("/help-requests/{helpRequestId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PO', 'ROLE_SW', 'ROLE_ADMIN')")
    public ResponseEntity<List<DuplicateDetectionDTO>> findDuplicateHelpRequests(@PathVariable String helpRequestId) {
        List<DuplicateDetectionDTO> duplicates = duplicateDetectionService.findDuplicateHelpRequests(helpRequestId);
        return ResponseEntity.ok(duplicates);
    }

    @GetMapping("/cases/search")
    @PreAuthorize("hasAnyAuthority('ROLE_PO', 'ROLE_SW', 'ROLE_ADMIN')")
    public ResponseEntity<List<DuplicateDetectionDTO>> searchSimilarCases(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String approximateAge,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String identificationMarks) {
        List<DuplicateDetectionDTO> similar = duplicateDetectionService.searchSimilarCases(
            location != null ? location : "",
            approximateAge != null ? approximateAge : "",
            gender != null ? gender : "",
            identificationMarks != null ? identificationMarks : ""
        );
        return ResponseEntity.ok(similar);
    }

    @GetMapping("/help-requests/search")
    @PreAuthorize("hasAnyAuthority('ROLE_PO', 'ROLE_SW', 'ROLE_ADMIN')")
    public ResponseEntity<List<DuplicateDetectionDTO>> searchSimilarHelpRequests(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String approximateAge,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String helpType) {
        List<DuplicateDetectionDTO> similar = duplicateDetectionService.searchSimilarHelpRequests(
            location != null ? location : "",
            approximateAge != null ? approximateAge : "",
            gender != null ? gender : "",
            helpType != null ? helpType : ""
        );
        return ResponseEntity.ok(similar);
    }

    @PostMapping("/cases/check")
    @PreAuthorize("hasAnyAuthority('ROLE_PO', 'ROLE_SW', 'ROLE_ADMIN')")
    public ResponseEntity<List<DuplicateDetectionDTO>> checkPotentialDuplicateCase(
            @RequestParam String location,
            @RequestParam(required = false) String approximateAge,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String identificationMarks,
            @RequestParam String incidentDate) {
        java.time.LocalDateTime date = java.time.LocalDateTime.parse(incidentDate);
        List<DuplicateDetectionDTO> duplicates = duplicateDetectionService.checkPotentialDuplicateCase(
            location,
            approximateAge != null ? approximateAge : "",
            gender != null ? gender : "",
            identificationMarks != null ? identificationMarks : "",
            date
        );
        return ResponseEntity.ok(duplicates);
    }

    @PostMapping("/help-requests/check")
    @PreAuthorize("hasAnyAuthority('ROLE_PO', 'ROLE_SW', 'ROLE_ADMIN')")
    public ResponseEntity<List<DuplicateDetectionDTO>> checkPotentialDuplicateHelpRequest(
            @RequestParam String location,
            @RequestParam(required = false) String approximateAge,
            @RequestParam(required = false) String gender,
            @RequestParam String helpType) {
        List<DuplicateDetectionDTO> duplicates = duplicateDetectionService.checkPotentialDuplicateHelpRequest(
            location,
            approximateAge != null ? approximateAge : "",
            gender != null ? gender : "",
            helpType
        );
        return ResponseEntity.ok(duplicates);
    }
}

