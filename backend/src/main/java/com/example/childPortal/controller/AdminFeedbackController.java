package com.example.childPortal.controller;

import com.example.childPortal.dto.*;
import com.example.childPortal.service.FeedbackService; import org.springframework.beans.factory.annotation.Autowired; import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/admin/feedback") @CrossOrigin(origins = "*")
public class AdminFeedbackController {
  @Autowired
  private FeedbackService feedbackService;
  @PostMapping("/dashboard")
  public ResponseEntity<List<FeedbackDTO>> getFeedbackDashboard(@RequestBody FeedbackFilterDTO filter) {
    List<FeedbackDTO> feedback = feedbackService.getFeedbackForDashboard(filter);
    return ResponseEntity.ok(feedback); 
  }
  
  @GetMapping("/recent")
  public ResponseEntity<List<FeedbackDTO>> getRecentFeedback(@RequestParam(defaultValue = "10") int limit) {
    List<FeedbackDTO> feedback = feedbackService.getRecentFeedback(limit);
    return ResponseEntity.ok(feedback); 
  }
  
  @GetMapping("/statistics")
  public ResponseEntity<FeedbackStatisticsDTO> getFeedbackStatistics() {
    FeedbackStatisticsDTO statistics = feedbackService.getFeedbackStatistics();
    return ResponseEntity.ok(statistics); 
  }
  
  public ResponseEntity<Double> getAverageRating() {
    Double averageRating = feedbackService.getAverageRating();
    return ResponseEntity.ok(averageRating); 
  }
  
  @GetMapping("/rating/{rating}")
  public ResponseEntity<List<FeedbackDTO>> getFeedbackByRating(@PathVariable Integer rating) {
    FeedbackFilterDTO filter = new FeedbackFilterDTO(); filter.setRating(rating);
    List<FeedbackDTO> feedback = feedbackService.getFeedbackForDashboard(filter);
    return ResponseEntity.ok(feedback); 
  }
  
  @GetMapping("/category/{category}")
  public ResponseEntity<List<FeedbackDTO>> getFeedbackByCategory(@PathVariable String category) {
    try {
      Feedback.Category categoryEnum = Feedback.Category.valueOf(category.toUpperCase());
      FeedbackFilterDTO filter = new FeedbackFilterDTO(); filter.setCategory(categoryEnum);
      List<FeedbackDTO> feedback = feedbackService.getFeedbackForDashboard(filter);
      return ResponseEntity.ok(feedback);
    }
    catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    } 
  }
  
  @GetMapping("/status/{status}")
  public ResponseEntity<List<FeedbackDTO>> getFeedbackByStatus(@PathVariable String status) {
    try {
      Feedback.FeedbackStatus statusEnum = Feedback.FeedbackStatus.valueOf(status.toUpperCase());
      
      FeedbackFilterDTO filter = new FeedbackFilterDTO();
      filter.setStatus(statusEnum);
      List<FeedbackDTO> feedback = feedbackService.getFeedbackForDashboard(filter);
      return ResponseEntity.ok(feedback);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    } 
  }
  
  @GetMapping("/search")
  public ResponseEntity<List<FeedbackDTO>> searchFeedback(@RequestParam String query) {
    FeedbackFilterDTO filter = new FeedbackFilterDTO();
    filter.setSearchText(query);
    List<FeedbackDTO> feedback = feedbackService.getFeedbackForDashboard(filter); return ResponseEntity.ok(feedback);
  }
  
  
  @GetMapping("/analytics")
  public ResponseEntity<Map<String, Object>> getFeedbackAnalytics(
    @RequestParam(required = false) String startDate, @RequestParam(required = false) String endDate) {
    LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : LocalDateTime.now().minusMonths(1);
    LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : LocalDateTime.now();
    Map<String, Object> analytics = feedbackService.getFeedbackAnalytics(start, end);
    return ResponseEntity.ok(analytics); 
  }
  
  public ResponseEntity<FeedbackSummary> getFeedbackSummary() {
    FeedbackSummary summary = new FeedbackSummary();
    FeedbackStatisticsDTO stats = feedbackService.getFeedbackStatistics(); 
    summary.setTotalFeedback(stats.getTotalFeedback());
    summary.setAverageRating(stats.getAverageRating());
    summary.setRecentFeedback(stats.getRecentFeedbackCount());
    List<FeedbackDTO> recent = feedbackService.getRecentFeedback(5); 
    summary.setRecentFeedbackList(recent);
    
    if (stats.getTotalFeedback() > 0) {
      double responseRate = (stats.getRespondedCount() * 100.0) / stats.getTotalFeedback();
      summary.setResponseRate(Math.round(responseRate * 10.0) / 10.0);
    }
      
      .setTopCategory(getTopCategory(stats));
    return ResponseEntity.ok(summary); }
  @GetMapping("/export")
  public ResponseEntity<String> exportFeedback(@RequestBody FeedbackFilterDTO filter) {
    return ResponseEntity.ok("Export functionality would be implemented here");
  }
  
  @GetMapping("/ratings")
  public ResponseEntity<List<FeedbackDTO>> getFeedbackWithRatings() {
    List<FeedbackDTO> feedback = feedbackService.getFeedbackWithRatingsOnly();
    return ResponseEntity.ok(feedback);
  }
  
  public static class FeedbackSummary {
    private long totalFeedback;
    private double averageRating;
    private long recentFeedback;
    private double responseRate;
    private String topCategory;
    private List<FeedbackDTO> recentFeedbackList;
    
    
    public long getTotalFeedback() { 
      return totalFeedback; 
    }

    public void setTotalFeedback(long totalFeedback) {
      this.totalFeedback = totalFeedback; 
    }
    public double getAverageRating() { 
      return averageRating; 
    }
    public void setAverageRating(double averageRating) {
      this.averageRating = averageRating; 
    }
    public long getRecentFeedback() { 
      return recentFeedback; 
    }
    public void setRecentFeedback(long recentFeedback) {
      this.recentFeedback = recentFeedback;
    }
    public double getResponseRate() { 
      return responseRate;
    }
    public void setResponseRate(double responseRate) {
      this.responseRate = responseRate;
    }
    public String getTopCategory() {
      return topCategory;
    }
    public void setTopCategory(String topCategory) {
      this.topCategory = topCategory;
    }
    public List<FeedbackDTO> getRecentFeedbackList() { 
      return recentFeedbackList;
    }
    public void setRecentFeedbackList(List<FeedbackDTO> recentFeedbackList) { 
      this.recentFeedbackList = recentFeedbackList; 
    }
}
  private String getTopCategory(FeedbackStatisticsDTO stats) {
    long max = Math.max(Math.max(stats.getComplimentCount(), stats.getSuggestionCount()),
                        Math.max(stats.getComplaintCount(), stats.getIssueCount()));
    if (max == stats.getComplimentCount()) 
      return "COMPLIMENT";
    if (max == stats.getSuggestionCount())
      return "SUGGESTION"; 
    if (max == stats.getComplaintCount())
      return "COMPLAINT";
    if (max == stats.getIssueCount()) 
      return "ISSUE";
    return "SATISFACTION"; }
}
