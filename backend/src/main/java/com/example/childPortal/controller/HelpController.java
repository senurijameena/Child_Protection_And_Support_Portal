package com.example.childPortal.controller;

import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.dto.HelpResponse;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.service.HelpRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/help-requests")

public class HelpController {
    @Autowired
    private HelpRequestService helpRequestService;

    @PostMapping("/request")
    public ResponseEntity<HelpResponse> createHelpRequest(
            @RequestBody HelpRequestDTO helpRequestDTO,
            @AuthenticationPrincipal String userId) {
        HelpResponse response = helpRequestService.createHelpRequest(helpRequestDTO, userId);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<HelpRequestDTO> getHelpRequest(@PathVariable String requestId) {
        HelpRequestDTO helpRequestDTO = helpRequestService.getHelpRequestById(requestId);
        return helpRequestDTO != null ? ResponseEntity.ok(helpRequestDTO) : ResponseEntity.notFound().build();
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<HelpRequestDTO>> getMyHelpRequests(@AuthenticationPrincipal String userId) {
        List<HelpRequestDTO> requests = helpRequestService.getHelpRequestsByRequester(userId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<HelpRequestDTO>> getHelpRequestsByWorker(@PathVariable String workerId) {
        List<HelpRequestDTO> requests = helpRequestService.getHelpRequestsByWorker(workerId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/all")
    public ResponseEntity<List<HelpRequestDTO>> getAllHelpRequests() {
        List<HelpRequestDTO> requests = helpRequestService.getAllHelpRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<HelpRequestDTO>> getHelpRequestsByStatus(@PathVariable RequestStatus status) {
        List<HelpRequestDTO> requests = helpRequestService.getHelpRequestsByStatus(status);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/type/{helpType}")
    public ResponseEntity<List<HelpRequestDTO>> getHelpRequestsByType(@PathVariable HelpType helpType) {
        List<HelpRequestDTO> requests = helpRequestService.getHelpRequestsByType(helpType);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/search/location")
    public ResponseEntity<List<HelpRequestDTO>> searchByLocation(@RequestParam String location) {
        List<HelpRequestDTO> requests = helpRequestService.searchHelpRequestsByLocation(location);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{requestId}/status")
    public ResponseEntity<HelpRequestDTO> updateHelpRequestStatus(
            @PathVariable String requestId,
            @RequestParam RequestStatus status,
            @AuthenticationPrincipal String userId) {
        HelpRequestDTO updatedRequest = helpRequestService.updateHelpRequestStatus(requestId, status, userId);
        return updatedRequest != null ? ResponseEntity.ok(updatedRequest) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/assign")
    public ResponseEntity<HelpRequestDTO> assignToSocialWorker(
            @PathVariable String requestId,
            @RequestParam String workerId,
            @AuthenticationPrincipal String adminId) {
        HelpRequestDTO updatedRequest = helpRequestService.assignHelpRequestToWorker(requestId, workerId, adminId);
        return updatedRequest != null ? ResponseEntity.ok(updatedRequest) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<String> deleteHelpRequest(@PathVariable String requestId) {
        boolean deleted = helpRequestService.deleteHelpRequest(requestId);
        return deleted ? ResponseEntity.ok("Help request deleted successfully") : ResponseEntity.notFound().build();
    }
}