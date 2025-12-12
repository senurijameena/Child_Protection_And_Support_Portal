package com.example.childPortal.controller; 

import com.example.childPortal.dto.TrackResponse; 
import com.example.childPortal.service.TrackingService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*; 

@RestController 
@RequestMapping("/api/track") 
@CrossOrigin(origins = "*") 
public class TrackingController { 
 
    @Autowired 
    private TrackingService trackingService; 
 
    @GetMapping("/{trackingId}") 
    public ResponseEntity<TrackResponse> trackCase(@PathVariable String trackingId) { 
        TrackResponse response = trackingService.trackById(trackingId); 
         
        if (response.isFound()) { 
            return ResponseEntity.ok(response); 
        } else { 
            return ResponseEntity.status(404).body(response); 
        } 
    } 
 
    @GetMapping("/case/{caseId}") 
    public ResponseEntity<TrackResponse> trackCaseById(@PathVariable String caseId) { 
        TrackResponse response = trackingService.trackCaseById(caseId); 
         
        if (response.isFound()) { 
            return ResponseEntity.ok(response); 
        } else { 
            return ResponseEntity.status(404).body(response); 
        } 
    } 
 
    @GetMapping("/help/{helpRequestId}") 
    public ResponseEntity<TrackResponse> trackHelpRequestById(@PathVariable String helpRequestId) { 
        TrackResponse response = trackingService.trackHelpRequestById(helpRequestId); 
         
        if (response.isFound()) { 
            return ResponseEntity.ok(response); 
        } else { 
            return ResponseEntity.status(404).body(response); 
        } 
    } 
 
    @PostMapping("/status") 
    public ResponseEntity<TrackResponse> trackByTrackingId(@RequestBody TrackRequest request) { 
        if (request.getTrackingId() == null || request.getTrackingId().trim().isEmpty()) { 
            TrackResponse errorResponse = new TrackResponse(""); 
            errorResponse.setFound(false); 
            errorResponse.setMessage("Please enter a tracking ID"); 
            return ResponseEntity.badRequest().body(errorResponse); 
        } 
         
        TrackResponse response = trackingService.trackById(request.getTrackingId()); 
         
        if (response.isFound()) { 
            return ResponseEntity.ok(response); 
        } else { 
            return ResponseEntity.status(404).body(response); 
        } 
    }

    public static class TrackRequest { 
        private String trackingId; 
        public String getTrackingId() { 
            return trackingId; 
        } 
        public void setTrackingId(String trackingId) { 
            this.trackingId = trackingId; 
        } 
    } 
} 