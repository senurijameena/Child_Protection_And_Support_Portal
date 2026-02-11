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
        // Fallback for userId if @AuthenticationPrincipal is failing to resolve
        if (userId == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                userId = auth.getName();
            }
        }

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

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<HelpRequestDTO> rejectHelpRequest(
            @PathVariable String requestId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        String reason = body.getOrDefault("reason", "No reason provided");
        HelpRequestDTO updatedRequest = helpRequestService.rejectHelpRequest(requestId, reason, userId);
        return updatedRequest != null ? ResponseEntity.ok(updatedRequest) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/accept")
    public ResponseEntity<HelpRequestDTO> acceptHelpRequest(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId) {
        HelpRequestDTO updatedRequest = helpRequestService.acceptHelpRequest(requestId, userId);
        return updatedRequest != null ? ResponseEntity.ok(updatedRequest) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/decline")
    public ResponseEntity<HelpRequestDTO> declineHelpRequest(
            @PathVariable String requestId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        String reason = body.getOrDefault("reason", "No reason provided");
        HelpRequestDTO updatedRequest = helpRequestService.declineHelpRequest(requestId, reason, userId);
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

    @PutMapping("/{requestId}/notes")
    public ResponseEntity<HelpRequestDTO> updateHelpRequestNotes(
            @PathVariable String requestId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        String notes = body.getOrDefault("notes", "");
        HelpRequestDTO updatedRequest = helpRequestService.updateHelpRequestNotes(requestId, notes, userId);
        return updatedRequest != null ? ResponseEntity.ok(updatedRequest) : ResponseEntity.notFound().build();
    }

   @PostMapping("/{requestId}/apply-package")
   public ResponseEntity<HelpRequestDTO> applyServicePackageToRequest(
           @PathVariable String requestId,
           @RequestBody java.util.Map<String, String> body,
           @AuthenticationPrincipal String userId) {
       String packageId = body.get("packageId");
       if (packageId == null || packageId.trim().isEmpty()) {
           return ResponseEntity.badRequest().build();
       }
       HelpRequestDTO updatedRequest = helpRequestService.applyServicePackageToRequest(requestId, packageId, userId);
       return updatedRequest != null ? ResponseEntity.ok(updatedRequest) : ResponseEntity.notFound().build();
   }

    @PutMapping("/{requestId}/package/accept")
    public ResponseEntity<HelpRequestDTO> acceptAppliedPackage(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId) {
        if (userId == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            userId = (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
        }
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        HelpRequestDTO updated = helpRequestService.acceptAppliedPackage(requestId, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/package/reject")
    public ResponseEntity<HelpRequestDTO> rejectAppliedPackage(
            @PathVariable String requestId,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        if (userId == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            userId = (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
        }
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        String reason = body != null ? (body.get("reason") != null ? body.get("reason") : "") : "";
        HelpRequestDTO updated = helpRequestService.rejectAppliedPackage(requestId, reason, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/package/service/status")
    public ResponseEntity<HelpRequestDTO> updateServiceItemStatus(
            @PathVariable String requestId,
            @RequestBody java.util.Map<String, Object> body,
            @AuthenticationPrincipal String userId) {
        String serviceItem = body != null && body.get("serviceItem") != null ? body.get("serviceItem").toString() : null;
        String status = body != null && body.get("status") != null ? body.get("status").toString() : null;
        String notes = body != null && body.get("notes") != null ? body.get("notes").toString() : null;
        java.time.LocalDateTime startDate = null;
        if (body != null && body.get("startDate") != null) {
            try {
                String s = body.get("startDate").toString().replace("Z", "").replace("z", "").substring(0, Math.min(19, body.get("startDate").toString().length()));
                startDate = java.time.LocalDateTime.parse(s);
            } catch (Exception e) { /* ignore */ }
        }
        HelpRequestDTO updated = helpRequestService.updateServiceItemStatus(requestId, serviceItem, status, userId, startDate, notes);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/package/service/resource")
    public ResponseEntity<HelpRequestDTO> assignServiceItemResource(
            @PathVariable String requestId,
            @RequestBody java.util.Map<String, Object> body,
            @AuthenticationPrincipal String userId) {
        String serviceItem = body != null && body.get("serviceItem") != null ? body.get("serviceItem").toString() : null;
        String assignedResource = body != null && body.get("assignedResource") != null ? body.get("assignedResource").toString() : null;
        String notes = body != null && body.get("notes") != null ? body.get("notes").toString() : null;
        java.time.LocalDateTime scheduledDate = null;
        if (body != null && body.get("scheduledDate") != null) {
            try {
                String s = body.get("scheduledDate").toString().replace("Z", "").substring(0, 19);
                scheduledDate = java.time.LocalDateTime.parse(s);
            } catch (Exception e) { /* ignore */ }
        }
        HelpRequestDTO updated = helpRequestService.assignServiceItemResource(requestId, serviceItem, assignedResource, scheduledDate, notes, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{requestId}/package/follow-up")
    public ResponseEntity<HelpRequestDTO> submitPackageFollowUp(
            @PathVariable String requestId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        if (userId == null) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            userId = (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
        }
        if (userId == null) return ResponseEntity.status(401).build();
        String followUpDate = body != null ? body.get("followUpDate") : null;
        String followUpType = body != null ? body.get("followUpType") : null;
        String notes = body != null ? body.get("notes") : null;
        HelpRequestDTO updated = helpRequestService.submitPackageFollowUp(requestId, followUpDate, followUpType, notes, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{requestId}/document")
    public ResponseEntity<HelpRequestDTO> uploadDocument(
            @PathVariable String requestId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal String userId) {
        try {
            // Mock file storage logic similar to user profile
            String fileName = file.getOriginalFilename();
            String documentUrl = "/uploads/documents/" + requestId + "/" + fileName;

            HelpRequestDTO updatedRequest = helpRequestService.addDocumentToHelpRequest(requestId, documentUrl);
            return updatedRequest != null ? ResponseEntity.ok(updatedRequest) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<String> deleteHelpRequest(@PathVariable String requestId) {
        boolean deleted = helpRequestService.deleteHelpRequest(requestId);
        return deleted ? ResponseEntity.ok("Help request deleted successfully") : ResponseEntity.notFound().build();
    }
}