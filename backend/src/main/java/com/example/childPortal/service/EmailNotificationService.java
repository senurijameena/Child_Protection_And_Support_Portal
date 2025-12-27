package com.example.childPortal.service;
import com.example.childPortal.model.Notification;
import com.example.childPortal.model.User;
import com.example.childPortal.repository.UserRepository; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.beans.factory.annotation.Value; 
import org.springframework.mail.javamail.JavaMailSender; 
import org.springframework.mail.javamail.MimeMessageHelper; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.mail.MessagingException; 
import jakarta.mail.internet.MimeMessage; 
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class NotificationService {
@Autowired
private JavaMailSender mailSender;
@Autowired
private UserRepository userRepository;
  @Value("${app.email.from}")
  private String fromEmail;
  @Value("${app.url}")
  private String appUrl;
  private static final Map<String, String> EMAIL_TEMPLATES = new HashMap<>();
  static { 
    EMAIL_TEMPLATES.put("USER_APPROVED",ures.</p>" +"<h2>Account Approved</h2>" +
                        "<p>Your account has been approved. You can now login and access all feat"
                        <a href='{LOGIN_URL}'>Login Now</a>");
      EMAIL_TEMPLATES.put("CASE_ASSIGNED",
                          "<h2>New Case Assigned</h2>" +
                          "<p>A new case has been assigned to you.</p>" + 
                          "<p><strong>Case ID:</strong> {CASE_ID}</p>" + 
                          "<p><strong>Priority:</strong> {PRIORITY}</p>" + 
                          "<a href='{CASE_URL}'>View Case Details</a>");
    EMAIL_TEMPLATES.put("HELP_REQUEST_STATUS",
                        "<h2>Help Request Update</h2>" +
                        "<p>Your help request has been updated.</p>" +
                        "<p><strong>Status:</strong> {STATUS}</p>" + 
                        "<p><strong>Request ID:</strong> {REQUEST_ID}</p>" + 
                        "<a href='{REQUEST_URL}'>View Details</a>");
  }
  public void sendUserApprovalNotification(String userId) { 
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    String subject = "Account Approved - Child Protection Portal"; 
    String content = EMAIL_TEMPLATES.get("USER_APPROVED").replace("{LOGIN_URL}", appUrl + "/login"); 
    sendEmail(user.getEmail(), subject, content);
    logNotification(userId, "USER_APPROVED","Your account has been approved by administrator");
    }
  public void sendCaseAssignmentNotification(String userId, String caseId, String p riority) {
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    String subject = "New Case Assigned - Child Protection Portal"; String content = EMAIL_TEMPLATES.get("CASE_ASSIGNED").replace("{CASE_ID}", caseId) .replace("{PRIORITY}", priority) .replace("{CASE_URL}", appUrl + "/cases/" + caseId);
    sendEmail(user.getEmail(), subject, content); logNotification(userId, "CASE_ASSIGNED","Case " + caseId + " has been assigned to you");
  }
  public void sendHelpRequestUpdate(String userId, String requestId, String status) {
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    String subject = "Help Request Update - Child Protection Portal"; String content = EMAIL_TEMPLATES.get("HELP_REQUEST_STATUS").replace("{REQUEST_ID}", requestId).replace("{STATUS}", status).replace("{REQUEST_URL}", appUrl + "/help-requests/" + requestId);
    sendEmail(user.getEmail(), subject, content); logNotification(userId, "HELP_REQUEST_UPDATE","Help request " + requestId + " status changed to " + status);
  }
  private void sendEmail(String to, String subject, String content) { 
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
    } 
  }
  helper.setFrom(fromEmail);
helper.setTo(to);
helper.setSubject(subject);
helper.setText(content, true);
mailSender.send(message);
} 
catch (MessagingException e) {
  throw new RuntimeException("Failed to send email", e);
}
}
private void logNotification(String userId, String type, String message) { 
  Notification notification = new Notification(); notification.setUserId(userId);
  notification.setType(type);
  notification.setMessage(message); 
  notification.setRead(false); 
  notification.setCreatedAt(LocalDateTime.now());
} 
}










