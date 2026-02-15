package com.example.childPortal.controller;

import com.example.childPortal.dto.HelpRequestCollaborationRequestDTO;
import com.example.childPortal.dto.HelpRequestCollaborationSummaryDTO;
import com.example.childPortal.dto.HelpRequestCollaboratorDTO;
import com.example.childPortal.service.HelpRequestCollaborationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/help-requests")
@CrossOrigin(origins = "*")
public class HelpRequestCollaborationController {

    private final HelpRequestCollaborationService collaborationService;

    public HelpRequestCollaborationController(HelpRequestCollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    @GetMapping("/{requestId}/collaboration")
    public ResponseEntity<HelpRequestCollaborationSummaryDTO> getCollaborationSummary(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(collaborationService.getSummary(requestId, userId));
    }

    @PostMapping("/{requestId}/collaboration/request")
    public ResponseEntity<HelpRequestCollaboratorDTO> requestCollaborator(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId,
            @RequestBody HelpRequestCollaborationRequestDTO body
    ) {
        return ResponseEntity.ok(collaborationService.requestCollaborator(requestId, userId, body));
    }

    @PostMapping("/collaboration/{collaborationId}/accept")
    public ResponseEntity<HelpRequestCollaboratorDTO> acceptRequest(
            @PathVariable String collaborationId,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(collaborationService.acceptRequest(collaborationId, userId));
    }

    @PostMapping("/collaboration/{collaborationId}/reject")
    public ResponseEntity<HelpRequestCollaboratorDTO> rejectRequest(
            @PathVariable String collaborationId,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(collaborationService.rejectRequest(collaborationId, userId));
    }

    @DeleteMapping("/{requestId}/collaboration/{collaboratorUserId}")
    public ResponseEntity<Void> removeCollaborator(
            @PathVariable String requestId,
            @PathVariable String collaboratorUserId,
            @AuthenticationPrincipal String userId
    ) {
        collaborationService.removeCollaborator(requestId, collaboratorUserId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/collaboration/my-pending")
    public ResponseEntity<List<HelpRequestCollaboratorDTO>> getMyPendingRequests(
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(collaborationService.getMyPendingRequests(userId));
    }

    @GetMapping("/collaboration/my-active")
    public ResponseEntity<List<HelpRequestCollaboratorDTO>> getMyActiveCollaborations(
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(collaborationService.getMyActiveCollaborations(userId));
    }
}
