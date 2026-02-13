package com.example.childPortal.controller;

import com.example.childPortal.model.FollowUp;
import com.example.childPortal.service.FollowUpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follow-ups")
public class FollowUpController {

    @Autowired
    private FollowUpService followUpService;

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<FollowUp>> getWorkerFollowUps(@PathVariable String workerId) {
        // In a real app, verify authentication matches workerId or is admin
        return ResponseEntity.ok(followUpService.getFollowUpsByWorker(workerId));
    }

    @GetMapping("/my-schedule")
    public ResponseEntity<List<FollowUp>> getMyFollowUps(@AuthenticationPrincipal String userId) {
        // Fallback for testing if userId is not automatically resolved
        if (userId == null) {
            // Return empty or error for now, or handle appropriately
        }
        return ResponseEntity.ok(followUpService.getFollowUpsByWorker(userId));
    }

    @PostMapping
    public ResponseEntity<?> createFollowUp(@RequestBody FollowUp followUp, @AuthenticationPrincipal String userId) {
        // Ensure the follow-up is assigned to the creator if not specified
        if (followUp.getSocialWorkerId() == null) {
            followUp.setSocialWorkerId(userId);
        }
        return ResponseEntity.ok(followUpService.createFollowUp(followUp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFollowUp(@PathVariable String id, @RequestBody FollowUp followUp) {
        FollowUp updated = followUpService.updateFollowUp(id, followUp);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Follow-Up not found"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFollowUp(@PathVariable String id) {
        followUpService.deleteFollowUp(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
