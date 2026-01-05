package com.example.childPortal.controller;
import com.example.childPortal.dto.StatusChangeRequestDTO;
import com.example.childPortal.service.StatusManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; 
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController 
@RequestMapping("/api/status") 
@CrossOrigin(origins = "*") 
public class StatusManagementController {
@Autowired
private StatusManagementService statusManagementService;
    @PutMapping("/change")
    public ResponseEntity<?> changeStatus(
@RequestBody StatusChangeRequestDTO request, @AuthenticationPrincipal String userId) {
        try {
            Map<String, Object> result =
statusManagementService.changeUserStatus(userId, request); return ResponseEntity.ok(result);
} catch (RuntimeException e) {
          return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
      @GetMapping("/my-status")
public ResponseEntity<?> getMyStatusDetails(@AuthenticationPrincipal String userId) {
        try {
            Map<String, Object> details =
statusManagementService.getUserStatusDetails(userId); return ResponseEntity.ok(details);
} catch (RuntimeException e) {
return ResponseEntity.badRequest()
.body(Map.of("success", false, "message", e.getMessage()));
        } 
}
    @GetMapping("/available/{role}")
    public ResponseEntity<?> getAvailableUsers(
      @PathVariable String role, 
      @RequestParam(required = false) String location,
      @RequestParam(required = false) String caseType,
      @AuthenticationPrincipal String adminId) {
      try {
        Map<String, Object> availableUsers =
          statusManagementService.getAvailableUsersForAssignment(role, location, caseType);
        return ResponseEntity.ok(availableUsers); 
      } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
      } 
    }
    @PutMapping("/admin/change/{userId}")
    public ResponseEntity<?> adminChangeStatus(
      @PathVariable String userId,
      @RequestBody StatusChangeRequestDTO request,
      @AuthenticationPrincipal String adminId) {
    try {
        Map<String, Object> result =
statusManagementService.changeUserStatus(userId, request);
      return ResponseEntity.ok(result);
    } catch (RuntimeException e) {
return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    }
    }
@GetMapping("/statistics/{role}")
public ResponseEntity<?> getStatusStatistics(
@PathVariable String role,
  @AuthenticationPrincipal String adminId) {
    try {
        com.example.childPortal.model.Role roleEnum =
com.example.childPortal.model.Role.valueOf(role.toUpperCase()); Map<String, Object> statistics =
statusManagementService.getStatusStatistics(roleEnum);
      return ResponseEntity.ok(statistics);
} catch (Exception e) {
return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
    } 
}
    @PostMapping("/available")
    public ResponseEntity<?> setAvailable(
      @RequestParam(required = false) String note, @AuthenticationPrincipal String userId) {
      StatusChangeRequestDTO request = new StatusChangeRequestDTO(); 
      request.setNewStatus(com.example.childPortal.model.AvailabilityStatus.AVAILABLE);
          request.setNote(note);
    return changeStatus(request, userId);
    }
    @PostMapping("/busy")
    public ResponseEntity<?> setBusy(
      @RequestParam(required = false) String note, @AuthenticationPrincipal String userId) {
StatusChangeRequestDTO request = new StatusChangeRequestDTO();
      request.setNewStatus(com.example.childPortal.model.AvailabilityStatus.BUSY); request.setNote(note);
    return changeStatus(request, userId);
}
    @PostMapping("/off-duty")
    public ResponseEntity<?> setOffDuty(
      @RequestParam(required = false) String note,
      @RequestParam(required = false) String expectedReturn,
      @AuthenticationPrincipal String userId) {
      StatusChangeRequestDTO request = new StatusChangeRequestDTO(); 
      request.setNewStatus(com.example.childPortal.model.AvailabilityStatus.OFF_DUTY);
      request.setNote(note); request.setExpectedReturnTime(expectedReturn);
      return changeStatus(request, userId);
    }
 @PostMapping("/emergency-only")
    public ResponseEntity<?> setEmergencyOnly(
@RequestParam(required = false) String note,
      @AuthenticationPrincipal String userId) {
      StatusChangeRequestDTO request = new StatusChangeRequestDTO();
      request.setNewStatus(com.example.childPortal.model.AvailabilityStatus.EMERGENCY_ONLY);
        request.setNote(note);
        return changeStatus(request, userId);
    }
  }









    
