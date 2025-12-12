package com.example.childPortal.controller;

import com.example.childPortal.dto.HelpRequestDTO; 
import com.example.childPortal.dto.HelpResponse; 
import com.example.childPortal.model.HelpRequest.RequestStatus; 
import com.example.childPortal.model.HelpType; 
import com.example.childPortal.service.HelpRequestService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*; 
import java.util.List; 

@RestController
@RequestMapping("/api/help-requests")
@CrossOrigin(origins = "*") 
public class HelpController {
    @Autowired 
    private HelpRequestService helpRequestService; 
 
    @PostMapping("/request") 
public ResponseEntity<HelpResponse> createHelpRequest(
        @RequestBody HelpRequestDTO helpRequestDTO,
        @AuthenticationPrincipal String userId) { 
    HelpResponse response = helpRequestService.createHelpRequest(helpRequestDTO, userId); 
    return response.isSuccess() ?  
        ResponseEntity.ok(response) :  
        ResponseEntity.badRequest().body(response); 
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
}