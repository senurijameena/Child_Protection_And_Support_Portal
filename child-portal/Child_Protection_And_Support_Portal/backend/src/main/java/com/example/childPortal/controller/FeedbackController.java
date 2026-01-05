package com.example.childPortal.controller; 

import com.example.childPortal.dto.FeedbackDTO; 
import com.example.childPortal.dto.FeedbackResponseDTO; 
import com.example.childPortal.model.Feedback.FeedbackType;  
import com.example.childPortal.model.Feedback.FeedbackStatus; 
import com.example.childPortal.service.FeedbackService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*; 
import java.util.List;
import java.util.Map;

@RestController 
@RequestMapping("/api/feedback") 
@CrossOrigin(origins = "http://localhost:5173") 
public class FeedbackController { 
    @Autowired 
    private FeedbackService feedbackService;

    @PostMapping("/submit") 
    public ResponseEntity<?> submitFeedback(
            @RequestBody FeedbackDTO feedbackDTO,
            @AuthenticationPrincipal String userId) { 
        String feedbackText = feedbackDTO.getMessage(); 
        if (feedbackText == null || feedbackText.trim().isEmpty()) { 
            return ResponseEntity.badRequest().body("Feedback text is required"); 
        } 
         
        FeedbackResponseDTO response = feedbackService.submitFeedback(feedbackDTO, userId); 
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response); 
    }

    @GetMapping("/{feedbackId}") 
    public ResponseEntity<FeedbackResponseDTO> getFeedback(@PathVariable String feedbackId) { 
        FeedbackResponseDTO feedback = feedbackService.getFeedbackById(feedbackId); 
        return feedback != null ? ResponseEntity.ok(feedback) : ResponseEntity.notFound().build(); 
    } 

    @GetMapping("/user/{userId}") 
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByUser(@PathVariable String userId) { 
        List<FeedbackResponseDTO> feedbackList = feedbackService.getFeedbackByUser(userId); 
        return ResponseEntity.ok(feedbackList); 
    }

    @GetMapping("/case/{caseId}") 
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByCase(@PathVariable String caseId) { 
        List<FeedbackResponseDTO> feedbackList = feedbackService.getFeedbackByCase(caseId); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @GetMapping("/all") 
    public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedback() { 
        List<FeedbackResponseDTO> feedbackList = feedbackService.getAllFeedback(); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @GetMapping("/public") 
    public ResponseEntity<List<FeedbackResponseDTO>> getPublicFeedback() { 
        List<FeedbackResponseDTO> feedbackList = feedbackService.getPublicFeedback(); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @GetMapping("/type/{type}") 
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByType(@PathVariable FeedbackType type) { 
        List<FeedbackResponseDTO> feedbackList = feedbackService.getFeedbackByType(type); 
        return ResponseEntity.ok(feedbackList); 
    } 


    @GetMapping("/status/{status}") 
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByStatus(@PathVariable FeedbackStatus status) { 
        List<FeedbackResponseDTO> feedbackList = feedbackService.getFeedbackByStatus(status); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @PutMapping("/{feedbackId}/status") 
    public ResponseEntity<FeedbackResponseDTO> updateStatus(
            @PathVariable String feedbackId, 
            @RequestParam FeedbackStatus status,
            @AuthenticationPrincipal String userId) { 
        FeedbackResponseDTO updatedFeedback = feedbackService.updateFeedbackStatus(feedbackId, status, userId); 
        return updatedFeedback != null ? ResponseEntity.ok(updatedFeedback) : ResponseEntity.notFound().build(); 
    } 

    @PostMapping("/{feedbackId}/respond") 
    public ResponseEntity<FeedbackResponseDTO> respondToFeedback(
            @PathVariable String feedbackId, 
            @RequestBody AdminResponseRequest request,
            @AuthenticationPrincipal String adminId) { 
        if (request.getResponse() == null || request.getResponse().trim().isEmpty()) { 
            return ResponseEntity.badRequest().build(); 
        } 
         
        FeedbackResponseDTO updatedFeedback = feedbackService.respondToFeedback(feedbackId, request.getResponse(), adminId); 
        return updatedFeedback != null ? ResponseEntity.ok(updatedFeedback) : ResponseEntity.notFound().build(); 
    } 

    @DeleteMapping("/{feedbackId}") 
    public ResponseEntity<String> deleteFeedback(@PathVariable String feedbackId) { 
        boolean deleted = feedbackService.deleteFeedback(feedbackId); 
        return deleted ? ResponseEntity.ok("Feedback deleted successfully") : ResponseEntity.notFound().build(); 
    } 
 
    @GetMapping("/average-rating") 
    public ResponseEntity<Double> getAverageRating() { 
        Double averageRating = feedbackService.getAverageRating(); 
        return ResponseEntity.ok(averageRating); 
    }

    @GetMapping("/rating-distribution")
    public ResponseEntity<Map<Integer, Long>> getRatingDistribution() {
        Map<Integer, Long> distribution = feedbackService.getRatingDistribution();
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Double averageRating = feedbackService.getAverageRating();
        Long totalCount = feedbackService.getTotalFeedbackCount();
        Map<Integer, Long> distribution = feedbackService.getRatingDistribution();
        
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("averageRating", averageRating);
        stats.put("totalCount", totalCount);
        stats.put("ratingDistribution", distribution);
        
        return ResponseEntity.ok(stats);
    } 

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByCategory(@PathVariable String category) { 
        List<FeedbackResponseDTO> feedbackList = feedbackService.getFeedbackByCase(category);
        return ResponseEntity.ok(feedbackList);
    }
    public static class AdminResponseRequest { 
        private String response; 
        public String getResponse() { return response; } 
        public void setResponse(String response) { this.response = response; } 
    } 
}