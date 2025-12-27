package com.example.childPortal.controller;
import com.example.childPortal.model.Notification;
import com.example.childPortal.repository.NotificationRepository;
import com.example.childPortal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; 
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController 
  @RequestMapping("/api/notifications") 
  @CrossOrigin(origins = "*")
  public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private NotificationService notificationService;
    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(
      @AuthenticationPrincipal String userId) { 
      List<Notification> notifications =notificationRepository.findByUserIdOrderByCreatedAtDesc(userId); 
      return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
      @AuthenticationPrincipal String userId) { 
      List<Notification> notifications =notificationRepository.findByUserIdAndReadFalse(userId); 
      return ResponseEntity.ok(notifications);
    }
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal String userId) {
      long count = notificationRepository.countByUserIdAndReadFalse(userId); 
      return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(
      @PathVariable String notificationId,
      @AuthenticationPrincipal String userId) {
      return notificationRepository.findById(notificationId).map(notification -> {
        if (!notification.getUserId().equals(userId)) {
          return ResponseEntity.status(403).build(); 
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(notification);
      }) 
        .orElse(ResponseEntity.notFound().build());
      }
  
     @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(
      @AuthenticationPrincipal String userId) { 
      List<Notification> unread =notificationRepository.findByUserIdAndReadFalse(userId); 
      unread.forEach(notification -> notification.setRead(true)); 
      notificationRepository.saveAll(unread);
      return ResponseEntity.ok("All notifications marked as read");
    }
    @PostMapping("/test/approval")
    public ResponseEntity<String> testApprovalNotification(
      @RequestBody Map<String, String> request) {
      String userId = request.get("userId");
      notificationService.sendUserApprovalNotification(userId); 
      return ResponseEntity.ok("Test notification sent");
    } 
  }










      
