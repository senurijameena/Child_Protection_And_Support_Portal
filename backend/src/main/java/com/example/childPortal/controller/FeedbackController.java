package com.example.childPortal.controller; 

import com.example.childPortal.dto.FeedbackDTO; 
import com.example.childPortal.dto.FeedbackResponseDTO; 
import com.example.childPortal.model.Feedback.FeedbackType; 
import com.example.childPortal.model.Feedback.Category; 
import com.example.childPortal.model.Feedback.FeedbackStatus; 
import com.example.childPortal.service.FeedbackService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*; 
import java.util.List; 

@RestController 
@RequestMapping("/api/feedback") 
@CrossOrigin(origins = "*") 
public class FeedbackController { 
    @Autowired 
    private FeedbackService feedbackService;

    @PostMapping("/submit") 
    public ResponseEntity<FeedbackResponseDTO> submitFeedback( 
            @RequestBody FeedbackDTO feedbackDTO, 
            @RequestHeader("X-User-Id") String userId) { 
         
        if (feedbackDTO.getFeedbackText() == null || feedbackDTO.getFeedbackText().trim().isEmpty()) { 
            return ResponseEntity.badRequest().body( 
                new FeedbackResponseDTO(null, "Feedback text is required", false) 
            ); 
        } 
         
        FeedbackResponseDTO response = feedbackService.submitFeedback(feedbackDTO, userId); 
        return response.isSuccess() ?  
            ResponseEntity.ok(response) :  
            ResponseEntity.badRequest().body(response); 
    }

    @GetMapping("/{feedbackId}") 
    public ResponseEntity<FeedbackDTO> getFeedback(@PathVariable String feedbackId) { 
        FeedbackDTO feedback = feedbackService.getFeedbackById(feedbackId); 
        return feedback != null ?  
            ResponseEntity.ok(feedback) :  
            ResponseEntity.notFound().build(); 
    } 

    @GetMapping("/user/{userId}") 
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByUser(@PathVariable String userId) { 
        List<FeedbackDTO> feedbackList = feedbackService.getFeedbackByUser(userId); 
        return ResponseEntity.ok(feedbackList); 
    }

    @GetMapping("/case/{caseId}") 
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByCase(@PathVariable String caseId) { 
        List<FeedbackDTO> feedbackList = feedbackService.getFeedbackByCase(caseId); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @GetMapping("/all") 
    public ResponseEntity<List<FeedbackDTO>> getAllFeedback() { 
        List<FeedbackDTO> feedbackList = feedbackService.getAllFeedback(); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @GetMapping("/public") 
    public ResponseEntity<List<FeedbackDTO>> getPublicFeedback() { 
        List<FeedbackDTO> feedbackList = feedbackService.getPublicFeedback(); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @GetMapping("/type/{type}") 
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByType(@PathVariable 
FeedbackType type) { 
        List<FeedbackDTO> feedbackList = feedbackService.getFeedbackByType(type); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @GetMapping("/category/{category}") 
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByCategory(@PathVariable Category category) { 
        List<FeedbackDTO> feedbackList = feedbackService.getFeedbackByCategory(category); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @GetMapping("/status/{status}") 
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByStatus(@PathVariable FeedbackStatus status) { 
        List<FeedbackDTO> feedbackList = feedbackService.getFeedbackByStatus(status); 
        return ResponseEntity.ok(feedbackList); 
    } 

    @GetMapping("/admin/all")
    public ResponseEntity<List<FeedbackDTO>> getAllFeedbackEnhanced() {
        List<FeedbackDTO> feedback = feedbackService.getAllFeedback();
        return ResponseEntity.ok(feedback); }

    @GetMapping("/admin/analytics/monthly")
    public ResponseEntity<MonthlyAnalytics> getMonthlyAnalytics() {
        MonthlyAnalytics analytics = new MonthlyAnalytics(); 
        LocalDateTime now = LocalDateTime.now(); LocalDateTime sixMonthsAgo = now.minusMonths(6);
        return ResponseEntity.ok(analytics); 
    }


    @PutMapping("/{feedbackId}/status") 
    public ResponseEntity<FeedbackDTO> updateStatus( 
            @PathVariable String feedbackId, 
            @RequestParam FeedbackStatus status) { 
        FeedbackDTO updatedFeedback = feedbackService.updateFeedbackStatus(feedbackId, status); 
        return updatedFeedback != null ?  
            ResponseEntity.ok(updatedFeedback) :  
            ResponseEntity.notFound().build(); 
    } 

    @PostMapping("/{feedbackId}/respond") 
    public ResponseEntity<FeedbackDTO> respondToFeedback( 
            @PathVariable String feedbackId, 
            @RequestBody AdminResponseRequest request, 
            @RequestHeader("X-Admin-Id") String adminId) { 
         
        if (request.getResponse() == null || request.getResponse().trim().isEmpty()) { 
            return ResponseEntity.badRequest().build(); 
        } 
         
        FeedbackDTO updatedFeedback = feedbackService.respondToFeedback(feedbackId, request.getResponse(), adminId); 
        return updatedFeedback != null ?  
            ResponseEntity.ok(updatedFeedback) :  
            ResponseEntity.notFound().build(); 
    } 

    @DeleteMapping("/{feedbackId}") 
    public ResponseEntity<String> deleteFeedback(@PathVariable String feedbackId) { 
        boolean deleted = feedbackService.deleteFeedback(feedbackId); 
        return deleted ?  
            ResponseEntity.ok("Feedback deleted successfully") :  
            ResponseEntity.notFound().build(); 
    } 
 
    @GetMapping("/average-rating") 
    public ResponseEntity<Double> getAverageRating() { 
        Double averageRating = feedbackService.getAverageRating(); 
        return ResponseEntity.ok(averageRating); 
    } 

    @GetMapping("/statistics") 
    public ResponseEntity<FeedbackStatistics> getStatistics() { 
        return ResponseEntity.ok(new FeedbackStatistics()); 
    } 

    @PostMapping("/admin/bulk-respond")
    public ResponseEntity<String> bulkRespondToFeedback(@RequestBody BulkRespondRequest request) {
        return ResponseEntity.ok("Bulk response functionality would be implemented here"); 
    }


    public static class AdminResponseRequest { 
        private String response; 
 
        public String getResponse() { return response; } 
        public void setResponse(String response) { this.response = response; } 
    } 
 
    public static class FeedbackStatistics { 
        private long totalFeedback; 
        private long pendingFeedback; 
        private long respondedFeedback; 
        private double averageRating; 

        public long getTotalFeedback() { 
            return totalFeedback; 
        } 
        public void setTotalFeedback(long totalFeedback) { 
            this.totalFeedback = totalFeedback;
        } 
 
        public long getPendingFeedback() { 
            return pendingFeedback; 
        } 
        public void setPendingFeedback(long pendingFeedback) { 
            this.pendingFeedback = pendingFeedback; 
        } 
 
        public long getRespondedFeedback() { 
            return respondedFeedback; 
        } 
        public void setRespondedFeedback(long respondedFeedback) { 
            this.respondedFeedback = respondedFeedback; 
        } 
        public double getAverageRating() { 
            return averageRating; 
        } 
        public void setAverageRating(double averageRating) { 
            this.averageRating = averageRating; 
        } 
    } 

    public static class MonthlyAnalytics {
        private Map<String, Long> feedbackByMonth = new HashMap<>(); 
        private Map<String, Double> averageRatingByMonth = new HashMap<>(); 
        private Map<String, Long> complaintsByMonth = new HashMap<>(); 
        private Map<String, Long> complimentsByMonth = new HashMap<>();
        
        public Map<String, Long> getFeedbackByMonth() { 
            return feedbackByMonth; 
        }
        public void setFeedbackByMonth(Map<String, Long> feedbackByMonth) { 
            this.feedbackByMonth = feedbackByMonth; 
        }
        public Map<String, Double> getAverageRatingByMonth() { 
            return averageRatingByMonth; 
        }
        public void setAverageRatingByMonth(Map<String, Double> averageRatingByMonth) { 
            this.averageRatingByMonth = averageRatingByMonth; 
        }
        public Map<String, Long> getComplaintsByMonth() { 
            return complaintsByMonth; 
        }
        public void setComplaintsByMonth(Map<String, Long> complaintsByMonth) { 
            this.complaintsByMonth = complaintsByMonth; 
        }
        public Map<String, Long> getComplimentsByMonth() { 
            return complimentsByMonth; 
        }
        public void setComplimentsByMonth(Map<String, Long> complimentsByMonth) { 
            this.complimentsByMonth = complimentsByMonth; 
        }
    }
    
    public static class BulkRespondRequest { 
        private List<String> feedbackIds; 
        private String response;
        private String adminId;
        
        public List<String> getFeedbackIds() { 
            return feedbackIds; 
        }
        public void setFeedbackIds(List<String> feedbackIds) { 
            this.feedbackIds = feedbackIds; 
        }
        public String getResponse() { 
            return response; 
        }
        public void setResponse(String response) { 
            this.response = response; 
        }
        public String getAdminId() { 
            return adminId; 
        }
        public void setAdminId(String adminId) { 
            this.adminId = adminId; 
        } 
    }
    
} 
