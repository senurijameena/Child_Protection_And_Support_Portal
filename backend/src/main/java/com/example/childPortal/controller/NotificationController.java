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
