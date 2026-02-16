package com.example.childPortal.controller;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.dto.ServiceOfferDTO;
import com.example.childPortal.dto.SocialWorkerDTO;
import com.example.childPortal.model.SocialWorker;
import com.example.childPortal.service.CaseService;
import com.example.childPortal.service.HelpRequestService;
import com.example.childPortal.service.ServiceOfferService;
import com.example.childPortal.service.SocialWorkerService;
import com.example.childPortal.service.StatusManagementService;
import com.example.childPortal.dto.StatusChangeRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/social-worker")
@CrossOrigin(origins = "*")
public class SocialWorkerController {

    @Autowired
    private SocialWorkerService socialWorkerService;

    @Autowired
    private CaseService caseService;

    @Autowired
    private HelpRequestService helpRequestService;

    @Autowired
    private ServiceOfferService serviceOfferService;
    
    @Autowired
    private StatusManagementService statusManagementService;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<SocialWorkerDTO> getProfile(@PathVariable String userId) {
        return socialWorkerService.getSocialWorkerByUserId(userId)
                .map(worker -> {
                    SocialWorkerDTO dto = new SocialWorkerDTO();
                    dto.setId(worker.getId());
                    dto.setUserId(worker.getUser().getId());
                    dto.setOrganization(worker.getOrganization());
                    dto.setSpecialization(worker.getSpecialization());
                    dto.setAvailabilityStatus(worker.getAvailabilityStatus());
                    // Add other fields as needed
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/statistics/{userId}")
    public ResponseEntity<Map<String, Object>> getStatistics(@PathVariable String userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Aggregate statistics
        long activeCases = caseService.getCasesForWorker(userId).size();
        long activeHelpRequests = helpRequestService.getHelpRequestsByWorker(userId).size();
        long pendingOffers = serviceOfferService.getOffersBySocialWorker(userId).stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus().toString()))
                .count();
        
        stats.put("activeCases", activeCases);
        stats.put("activeHelpRequests", activeHelpRequests);
        stats.put("pendingOffers", pendingOffers);
        stats.put("totalAssigned", activeCases + activeHelpRequests);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/assignments/active/{userId}")
    public ResponseEntity<List<CaseDTO>> getActiveAssignments(@PathVariable String userId) {
        List<CaseDTO> cases = caseService.getCasesForWorker(userId);
        return ResponseEntity.ok(cases);
    }
    
    @GetMapping("/offers/pending/{userId}")
    public ResponseEntity<List<ServiceOfferDTO>> getPendingOffers(@PathVariable String userId) {
         List<ServiceOfferDTO> offers = serviceOfferService.getOffersBySocialWorker(userId).stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus().toString()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/requests/urgent")
    public ResponseEntity<List<HelpRequestDTO>> getUrgentRequests() {
        // Assuming we want help requests with HIGH/URGENT priority
        // Since HelpRequestService expects specific status/type, we might need a custom method or filter
        // For now, let's get all Open requests and filter
        List<HelpRequestDTO> urgentRequests = helpRequestService.getAllHelpRequests().stream()
                .filter(r -> "URGENT".equalsIgnoreCase(r.getPriority().toString()) || "HIGH".equalsIgnoreCase(r.getPriority().toString()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(urgentRequests);
    }

    @GetMapping("/requests/available/{userId}")
    public ResponseEntity<List<HelpRequestDTO>> getAvailableRequests(@PathVariable String userId) {
        // Return requests that are OPEN and not yet assigned
        List<HelpRequestDTO> available = helpRequestService.getAllHelpRequests().stream()
                .filter(r -> r.getAssignedWorkerId() == null && "OPEN".equalsIgnoreCase(r.getStatus().toString()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(available);
    }
    
    @GetMapping("/schedule/{userId}")
    public ResponseEntity<Map<String, Object>> getSchedule(@PathVariable String userId, @RequestParam(required = false) String date) {
         // Mock implementation or use ServiceOffer upcoming services
         Map<String, Object> schedule = new HashMap<>();
         schedule.put("date", date);
         schedule.put("appointments", List.of()); // Empty list for now
         return ResponseEntity.ok(schedule);
    }
    
    @GetMapping("/resources/available/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getAvailableResources(@PathVariable String userId) {
        // Mock implementation
        return ResponseEntity.ok(List.of(
            Map.of("id", "1", "name", "Emergency Vehicle", "status", "AVAILABLE"),
            Map.of("id", "2", "name", "First Aid Kit", "status", "AVAILABLE")
        ));
    }
    
    @PostMapping("/status/update")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, String> statusData, @AuthenticationPrincipal String userId) {
        String newStatus = statusData.get("status");
        String note = statusData.get("reason");
        
        StatusChangeRequestDTO request = new StatusChangeRequestDTO();
        // Map string to enum if needed, or let service handle it
        try {
             request.setNewStatus(com.example.childPortal.model.AvailabilityStatus.valueOf(newStatus));
             request.setNote(note);
             return ResponseEntity.ok(statusManagementService.changeUserStatus(userId, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
        }
    }
}
