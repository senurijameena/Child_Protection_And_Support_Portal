package com.example.childPortal.controller;

import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.dto.HelpResponse;
import com.example.childPortal.dto.PublicAssignedResourceDTO;
import com.example.childPortal.dto.UpcomingFollowUpPublicDTO;
import com.example.childPortal.model.FollowUp;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.ResourceAssignment;
import com.example.childPortal.repository.FollowUpRepository;
import com.example.childPortal.repository.ResourceAssignmentRepository;
import com.example.childPortal.service.HelpRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/help-requests")
public class HelpController {
    @Autowired
    private HelpRequestService helpRequestService;

    @Autowired
    private ResourceAssignmentRepository resourceAssignmentRepository;

    @Autowired
    private FollowUpRepository followUpRepository;

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

    /**
     * Public user: assigned resources for a help request.
     * Only the requester of the request can see these. Returns public-safe fields only:
     * - resourceName, serviceType, contactPhone, address, emergencySupport (if available),
     *   instructions (specialInstructions), assignedAt.
     */
    @GetMapping("/{requestId}/assigned-resources-public")
    public ResponseEntity<List<PublicAssignedResourceDTO>> getAssignedResourcesPublic(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId) {
        if (userId == null) {
            var auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            userId = (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
        }
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        HelpRequestDTO request = helpRequestService.getHelpRequestById(requestId);
        if (request == null || request.getRequesterUserId() == null ||
                !request.getRequesterUserId().equals(userId)) {
            // Do not leak whether the request exists
            return ResponseEntity.notFound().build();
        }

        List<ResourceAssignment> assignments = resourceAssignmentRepository.findByHelpRequestId(requestId);
        List<PublicAssignedResourceDTO> result = assignments.stream()
                .map(a -> {
                    PublicAssignedResourceDTO dto = new PublicAssignedResourceDTO();
                    dto.setResourceName(a.getResourceName());
                    dto.setServiceType(a.getServiceItem());
                    dto.setContactPhone(a.getResourcePhone());
                    String address = (a.getResourceAddress() != null && !a.getResourceAddress().isBlank())
                            ? a.getResourceAddress()
                            : a.getLocation();
                    dto.setAddress(address);
                    // emergencySupport is not yet stored on ResourceAssignment in this version,
                    // so we leave it null (frontend will treat as "not specified").
                    dto.setInstructions(a.getSpecialInstructions());
                    dto.setAssignedAt(a.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    private static String followUpTypeToMethod(String type) {
        if (type == null || type.isBlank()) return "Follow-up";
        switch (type.toUpperCase()) {
            case "PHONE_CALL":
                return "Phone Call";
            case "HOME_VISIT":
                return "Home Visit";
            case "ONLINE_MEETING":
                return "Online Meeting";
            case "HOSPITAL_VISIT":
                return "Hospital Visit";
            case "DOCUMENT_COLLECTION":
                return "Document Collection";
            case "OFFICE_VISIT":
                return "Office Visit";
            default:
                return type.replace("_", " ");
        }
    }

    private static String normalizeFollowUpStatus(String status) {
        if (status == null || status.isBlank()) return "SCHEDULED";
        String s = status.toUpperCase();
        if ("DONE".equals(s)) return "COMPLETED";
        if ("UPCOMING".equals(s) || "CONFIRMED".equals(s) || "URGENT".equals(s)) return "SCHEDULED";
        return s;
    }

    /**
     * Public user: follow-ups for a help request (upcoming + recent history).
     * Only the requester can see these. Returns:
     * - scheduledDate, method, status, nextScheduledDate (for MISSED/RESCHEDULED).
     */
    @GetMapping("/{requestId}/follow-ups/public")
    public ResponseEntity<List<UpcomingFollowUpPublicDTO>> getFollowUpsPublic(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId) {
        if (userId == null) {
            var auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            userId = (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
        }
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        HelpRequestDTO request = helpRequestService.getHelpRequestById(requestId);
        if (request == null || request.getRequesterUserId() == null ||
                !request.getRequesterUserId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }

        List<FollowUp> all = followUpRepository.findByHelpRequestId(requestId);

        List<UpcomingFollowUpPublicDTO> list = all.stream()
                .filter(f -> f.getScheduledDate() != null)
                .sorted((a, b) -> a.getScheduledDate().compareTo(b.getScheduledDate()))
                .map(f -> {
                    UpcomingFollowUpPublicDTO dto = new UpcomingFollowUpPublicDTO();
                    dto.setScheduledDate(f.getScheduledDate().toString());
                    dto.setMethod(followUpTypeToMethod(f.getType()));
                    String normalizedStatus = normalizeFollowUpStatus(f.getStatus());
                    dto.setStatus(normalizedStatus);
                    dto.setNextScheduledDate(
                            f.getNextScheduledDate() != null ? f.getNextScheduledDate().toString() : null);
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<HelpRequestDTO>> getMyHelpRequests(@AuthenticationPrincipal String userId) {
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
    public ResponseEntity<List<HelpRequestDTO>> getHelpRequestsByWorker(
            @PathVariable String workerId,
            @AuthenticationPrincipal String userId) {
        // Enforce data isolation: Always use the authenticated user's ID
        // This prevents issues where a shared browser session might send a stale ID
        // from the frontend
        if (userId == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            userId = (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
        }

        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        List<HelpRequestDTO> requests = helpRequestService.getHelpRequestsByWorker(userId);
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
        String serviceItem = body != null && body.get("serviceItem") != null ? body.get("serviceItem").toString()
                : null;
        String status = body != null && body.get("status") != null ? body.get("status").toString() : null;
        String notes = body != null && body.get("notes") != null ? body.get("notes").toString() : null;
        java.time.LocalDateTime startDate = null;
        if (body != null && body.get("startDate") != null) {
            try {
                String s = body.get("startDate").toString().replace("Z", "").replace("z", "").substring(0,
                        Math.min(19, body.get("startDate").toString().length()));
                startDate = java.time.LocalDateTime.parse(s);
            } catch (Exception e) {
                /* ignore */ }
        }
        HelpRequestDTO updated = helpRequestService.updateServiceItemStatus(requestId, serviceItem, status, userId,
                startDate, notes);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/package/service/resource")
    public ResponseEntity<HelpRequestDTO> assignServiceItemResource(
            @PathVariable String requestId,
            @RequestBody java.util.Map<String, Object> body,
            @AuthenticationPrincipal String userId) {
        String serviceItem = body != null && body.get("serviceItem") != null ? body.get("serviceItem").toString()
                : null;
        String assignedResource = body != null && body.get("assignedResource") != null
                ? body.get("assignedResource").toString()
                : null;
        String notes = body != null && body.get("notes") != null ? body.get("notes").toString() : null;
        java.time.LocalDateTime scheduledDate = null;
        if (body != null && body.get("scheduledDate") != null) {
            try {
                String s = body.get("scheduledDate").toString().replace("Z", "").substring(0, 19);
                scheduledDate = java.time.LocalDateTime.parse(s);
            } catch (Exception e) {
                /* ignore */ }
        }
        HelpRequestDTO updated = helpRequestService.assignServiceItemResource(requestId, serviceItem, assignedResource,
                scheduledDate, notes, userId);
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
        if (userId == null)
            return ResponseEntity.status(401).build();
        String followUpDate = body != null ? body.get("followUpDate") : null;
        String followUpType = body != null ? body.get("followUpType") : null;
        String notes = body != null ? body.get("notes") : null;
        HelpRequestDTO updated = helpRequestService.submitPackageFollowUp(requestId, followUpDate, followUpType, notes,
                userId);
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

    @PostMapping("/{requestId}/package/adjustment")
    public ResponseEntity<HelpRequestDTO> requestPackageAdjustment(
            @PathVariable String requestId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        String serviceItem = body.get("serviceItem");
        String message = body.get("message");
        HelpRequestDTO updated = helpRequestService.requestServiceAdjustment(requestId, serviceItem, message, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{requestId}/service/start")
    public ResponseEntity<HelpRequestDTO> startServiceExecution(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId) {
        HelpRequestDTO updated = helpRequestService.startServiceExecution(requestId, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/service/outcome")
    public ResponseEntity<HelpRequestDTO> updateServiceOutcome(
            @PathVariable String requestId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        String serviceItem = body.get("serviceItem");
        String outcome = body.get("outcome");
        String reason = body.get("reason");
        String notes = body.get("notes");
        HelpRequestDTO updated = helpRequestService.updateServiceOutcome(requestId, serviceItem, outcome, reason, notes,
                userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{requestId}/service/assessment")
    public ResponseEntity<HelpRequestDTO> submitFinalAssessment(
            @PathVariable String requestId,
            @RequestBody HelpRequest.FinalAssessment assessment,
            @AuthenticationPrincipal String userId) {
        HelpRequestDTO updated = helpRequestService.submitFinalAssessment(requestId, assessment, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{requestId}/finalize")
    public ResponseEntity<HelpRequestDTO> finalizeCase(
            @PathVariable String requestId,
            @AuthenticationPrincipal String userId) {
        HelpRequestDTO updated = helpRequestService.finalizeCase(requestId, userId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<String> deleteHelpRequest(@PathVariable String requestId) {
        boolean deleted = helpRequestService.deleteHelpRequest(requestId);
        return deleted ? ResponseEntity.ok("Help request deleted successfully") : ResponseEntity.notFound().build();
    }
}
