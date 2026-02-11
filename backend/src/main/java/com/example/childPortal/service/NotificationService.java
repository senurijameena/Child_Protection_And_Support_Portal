package com.example.childPortal.service;

import com.example.childPortal.model.Notification;
import com.example.childPortal.model.User;
import com.example.childPortal.model.Role;
import com.example.childPortal.model.AvailabilityStatus;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.repository.NotificationRepository;
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
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class NotificationService {
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Value("${app.email.from:no-reply@childportal.gov.in}")
    private String fromEmail;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    private static final Map<String, String> EMAIL_TEMPLATES = new HashMap<>();

    static {
        EMAIL_TEMPLATES.put("USER_APPROVED",
                "<h2>Account Approved</h2>" +
                        "<p>Your account has been approved. You can now login and access all features.</p>" +
                        "<a href='{LOGIN_URL}'>Login Now</a>");

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

        EMAIL_TEMPLATES.put("HELP_REQUEST_ASSIGNED",
                "<h2>New Help Request Assigned</h2>" +
                        "<p>A new help request has been assigned to you.</p>" +
                        "<p><strong>Request ID:</strong> {REQUEST_ID}</p>" +
                        "<p><strong>Priority:</strong> {PRIORITY}</p>" +
                        "<a href='{REQUEST_URL}'>View Details</a>");

        EMAIL_TEMPLATES.put("REGISTRATION_SUCCESS",
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                        "<h2 style='color: #1a56db;'>🎉 Registration Successful!</h2>" +
                        "<p>Dear {USER_NAME},</p>" +
                        "<p>Congratulations! Your account has been successfully created on the <strong>Child Protection and Support Portal</strong>.</p>"
                        +
                        "<div style='background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
                        "<p><strong>Account Details:</strong></p>" +
                        "<ul>" +
                        "<li><strong>User ID:</strong> {USER_ID}</li>" +
                        "<li><strong>Email:</strong> {USER_EMAIL}</li>" +
                        "<li><strong>Role:</strong> {USER_ROLE}</li>" +
                        "<li><strong>Status:</strong> Auto-Approved ✓</li>" +
                        "</ul>" +
                        "</div>" +
                        "<p>Your account is now active and ready to use. You can access all features immediately.</p>" +
                        "<p><strong>What's Next?</strong></p>" +
                        "<ul>" +
                        "<li>Log in to your dashboard</li>" +
                        "<li>Complete your profile for better assistance</li>" +
                        "<li>Explore the platform features</li>" +
                        "</ul>" +
                        "<div style='text-align: center; margin: 30px 0;'>" +
                        "<a href='{DASHBOARD_URL}' style='background-color: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;'>Access Dashboard</a>"
                        +
                        "</div>" +
                        "<p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>"
                        +
                        "<p>Thank you for joining us in protecting children!</p>" +
                        "<p style='margin-top: 30px;'>Best regards,<br><strong>Child Protection and Support Portal Team</strong></p>"
                        +
                        "</div>");
    }

    public void sendUserApprovalNotification(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String subject = "Account Approved - Child Protection Portal";
        String content = EMAIL_TEMPLATES.get("USER_APPROVED")
                .replace("{LOGIN_URL}", appUrl + "/login");
        sendEmail(user.getEmail(), subject, content);
        logNotification(userId, "USER_APPROVED", "Your account has been approved by administrator");
    }

    public void sendCaseAssignmentNotification(String userId, String caseId, String priority, boolean isAnonymous) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Always send app notification
        logNotification(userId, "CASE_ASSIGNED", "Case " + caseId + " has been assigned to you");

        // Only send email/SMS if not anonymous
        if (!isAnonymous) {
            String subject = "New Case Assigned - Child Protection Portal";
            String content = EMAIL_TEMPLATES.get("CASE_ASSIGNED")
                    .replace("{CASE_ID}", caseId)
                    .replace("{PRIORITY}", priority)
                    .replace("{CASE_URL}", appUrl + "/cases/" + caseId);
            sendEmail(user.getEmail(), subject, content);
        }
    }

    public void sendHelpRequestUpdate(String userId, String requestId, String status, boolean isAnonymous) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Always send app notification
        logNotification(userId, "HELP_REQUEST_UPDATE",
                "Help request " + requestId + " status changed to " + status);

        // Only send email/SMS if not anonymous
        if (!isAnonymous) {
            String subject = "Help Request Update - Child Protection Portal";
            String content = EMAIL_TEMPLATES.get("HELP_REQUEST_STATUS")
                    .replace("{REQUEST_ID}", requestId)
                    .replace("{STATUS}", status)
                    .replace("{REQUEST_URL}", appUrl + "/help-requests/" + requestId);
            sendEmail(user.getEmail(), subject, content);
        }
    }

    public void sendHelpRequestAssignmentNotification(String userId, String requestId, String trackingId,
            String priority, boolean isAnonymous) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Always send app notification with actionUrl
        // Social workers view assigned requests in their dashboard at /social-worker/requests/:requestId
        String actionUrl = "/social-worker/requests/" + requestId;

        String title = "New Help Request Assigned";
        logNotification(userId, "HELP_REQUEST_ASSIGNED", title,
                "Help Request " + trackingId + " (" + priority + ") has been assigned to you.", actionUrl);

        // Send email
        String subject = "New Help Request Assigned - Child Protection Portal";
        String content = EMAIL_TEMPLATES.get("HELP_REQUEST_ASSIGNED")
                .replace("{REQUEST_ID}", trackingId)
                .replace("{PRIORITY}", priority)
                .replace("{REQUEST_URL}", appUrl + "/dashboard"); // Redirect to dashboard to see new requests
        sendEmail(user.getEmail(), subject, content);
    }

    /**
     * Notify all admins when a new case is submitted.
     */
    public void sendCaseCreatedNotificationToAdmin(String databaseId, String trackingId, String caseType) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        String actionUrl = "/admin/cases/" + databaseId;
        String title = "New Case Submitted";
        String message = "Case " + trackingId + " (" + (caseType != null ? caseType : "Unknown") + ") has been submitted for review.";
        for (User admin : admins) {
            logNotification(admin.getId(), "NEW_CASE_ADMIN", title, message, actionUrl);
        }
    }

    /**
     * Notify all admins when a new help request is submitted.
     */
    public void sendHelpRequestCreatedNotificationToAdmin(String databaseId, String trackingId, String helpType) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        String actionUrl = "/admin/help-requests/" + databaseId;
        String title = "New Help Request Submitted";
        String message = "Help Request " + trackingId + " (" + (helpType != null ? helpType : "Unknown") + ") has been submitted for review.";
        for (User admin : admins) {
            logNotification(admin.getId(), "NEW_HELP_REQUEST_ADMIN", title, message, actionUrl);
        }
    }

    /**
     * Notify all admins when police station updates case status.
     */
    public void sendCaseStatusUpdateToAdmin(String caseId, String trackingId, String status, String updatedBy) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        String actionUrl = "/admin/cases/" + caseId;
        String title = "Case Status Updated";
        String message = "Case " + trackingId + " updated to " + status + " by " + updatedBy;
        for (User admin : admins) {
            logNotification(admin.getId(), "CASE_STATUS_UPDATE_ADMIN", title, message, actionUrl);
        }
    }

    /**
     * Notify all admins when case/request is completed.
     */
    public void sendCaseCompletedNotificationToAdmin(String caseId, String trackingId) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        String actionUrl = "/admin/cases/" + caseId;
        String title = "Case Completed";
        String message = "Case " + trackingId + " has been completed.";
        for (User admin : admins) {
            logNotification(admin.getId(), "CASE_COMPLETED_ADMIN", title, message, actionUrl);
        }
    }

    public void sendCaseCreatedNotification(String userId, String databaseId, String trackingId, boolean isAnonymous) {
        // Always send app notification with actionUrl
        String actionUrl = "/cases/" + databaseId;
        String title = "Case Created Successfully";
        logNotification(userId, "CASE_CREATED", title, "Your case " + trackingId + " has been created successfully",
                actionUrl);

        // Only send email/SMS if not anonymous
        if (!isAnonymous && userId != null) {
            try {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                String subject = "Case Created - Child Protection Portal";
                String content = "<h2>Case Created Successfully</h2>" +
                        "<p>Your case has been created and is being reviewed.</p>" +
                        "<p><strong>Case ID:</strong> " + trackingId + "</p>" +
                        "<a href='" + appUrl + "/cases/" + databaseId + "'>View Case Details</a>";
                sendEmail(user.getEmail(), subject, content);
            } catch (Exception e) {
                System.err.println("Failed to send case creation email: " + e.getMessage());
            }
        }
    }

    public void sendHelpRequestCreatedNotification(String userId, String databaseId, String trackingId,
            boolean isAnonymous) {
        // Always send app notification with actionUrl
        String actionUrl = "/help-requests/" + databaseId;
        String title = "Help Request Created Successfully";
        logNotification(userId, "HELP_REQUEST_CREATED", title,
                "Your help request " + trackingId + " has been created successfully", actionUrl);

        // Only send email/SMS if not anonymous
        if (!isAnonymous && userId != null) {
            try {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                String subject = "Help Request Created - Child Protection Portal";
                String content = "<h2>Help Request Created Successfully</h2>" +
                        "<p>Your help request has been created and is being reviewed.</p>" +
                        "<p><strong>Request ID:</strong> " + trackingId + "</p>" +
                        "<a href='" + appUrl + "/help-requests/" + databaseId + "'>View Request Details</a>";
                sendEmail(user.getEmail(), subject, content);
            } catch (Exception e) {
                System.err.println("Failed to send help request creation email: " + e.getMessage());
            }
        }
    }

    /**
     * Broadcast a maintenance announcement notification to all users.
     */
    public void sendMaintenanceAnnouncementToAllUsers(String announcementId, String title, String message) {
        List<User> allUsers = userRepository.findAll();
        String notificationTitle = (title != null && !title.isBlank()) ? title : "System Maintenance Notice";
        String notificationMessage = (message != null && !message.isBlank())
                ? message
                : "The system will undergo maintenance. Some features may be temporarily unavailable.";

        for (User user : allUsers) {
            // Informational broadcast, no specific action URL required
            logNotification(user.getId(), "MAINTENANCE_ANNOUNCEMENT", notificationTitle, notificationMessage, null);
        }
    }

    /**
     * Send workshop announcement emails to all public users and social workers.
     */
    public void sendWorkshopAnnouncementEmailToPublicAndSocialWorkers(String title, String message) {
        String subject = (title != null && !title.isBlank())
                ? "[Workshop] " + title
                : "Upcoming Workshop - Child Protection and Support Portal";
        String body = (message != null && !message.isBlank())
                ? message
                : "You are invited to an upcoming workshop on child protection and support. Please log in to the portal for more details.";

        // Public users
        List<User> publicUsers = userRepository.findByRole(Role.PU);
        for (User user : publicUsers) {
            sendEmail(user.getEmail(), subject, body);
        }

        // Social workers
        List<User> socialWorkers = userRepository.findByRole(Role.SW);
        for (User user : socialWorkers) {
            sendEmail(user.getEmail(), subject, body);
        }
    }

    private void sendEmail(String to, String subject, String content) {
        try {
            if (mailSender == null) {
                System.err.println("Mail sender not configured. Email not sent to: " + to);
                return;
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (MessagingException e) {

            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {

            System.err.println("Unexpected error sending email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void logNotification(String userId, String type, String message) {
        logNotification(userId, type, null, message, null);
    }

    private void logNotification(String userId, String type, String message, String actionUrl) {
        logNotification(userId, type, null, message, actionUrl);
    }

    private void logNotification(String userId, String type, String title, String message, String actionUrl) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public void sendStatusChangeNotificationToAdmin(String userId, String userName, Role role,
            AvailabilityStatus oldStatus,
            AvailabilityStatus newStatus, String note) {
        String subject = String.format("Status Change: %s %s", userName, role);
        String content = String.format(
                "<h2>User Status Change</h2>" +
                        "<p><strong>User:</strong> %s (%s)</p>" +
                        "<p><strong>Role:</strong> %s</p>" +
                        "<p><strong>Status Changed:</strong> %s → %s</p>" +
                        "<p><strong>Note:</strong> %s</p>" +
                        "<p><strong>Time:</strong> %s</p>",
                userName, userId, role, oldStatus, newStatus,
                note != null ? note : "No note provided",
                LocalDateTime.now());
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            sendEmail(admin.getEmail(), subject, content);
        }
    }

    public void sendOffDutyNotificationToTeam(String userId, Role role, String note) {
        String subject = String.format("Team Member Going Off Duty: %s", role);
        String content = String.format(
                "<h2>Team Member Off Duty</h2>" +
                        "<p>A %s is going off duty.</p>" +
                        "<p><strong>Note:</strong> %s</p>" +
                        "<p>Please adjust assignments accordingly.</p>",
                role, note != null ? note : "No note provided");
        List<User> teamMembers = userRepository.findByRole(role);
        for (User member : teamMembers) {
            if (!member.getId().equals(userId)) {
                sendEmail(member.getEmail(), subject, content);
            }
        }
    }

    public void sendEmergencyOnlyStatusNotification(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String subject = "Emergency-Only Status Activated";
        String content = String.format(
                "<h2>Emergency-Only Status</h2>" +
                        "<p>You have set your status to EMERGENCY_ONLY.</p>" +
                        "<p>You will only receive emergency cases/requests until you change your status.</p>" +
                        "<p>To change your status, visit your dashboard.</p>");
        sendEmail(user.getEmail(), subject, content);
    }

    public void sendWorkloadAlertNotification(String userId, double workloadPercentage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String subject = "Workload Alert";
        String content = String.format(
                "<h2>Workload Alert</h2>" +
                        "<p>Your current workload is at %.1f%% of capacity.</p>" +
                        "<p>Consider updating your status or requesting transfers if needed.</p>",
                workloadPercentage);
        sendEmail(user.getEmail(), subject, content);
    }

    public void sendRegistrationSuccessEmail(String userId, String userRole) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String roleDisplay = getRoleDisplayName(userRole);
            String userID = generateUserID(userId, userRole);
            String dashboardUrl = getDashboardUrl(userRole);

            String subject = "Registration Successful - Child Protection and Support Portal";
            String content = EMAIL_TEMPLATES.get("REGISTRATION_SUCCESS")
                    .replace("{USER_NAME}", user.getFullName())
                    .replace("{USER_ID}", userID)
                    .replace("{USER_EMAIL}", user.getEmail())
                    .replace("{USER_ROLE}", roleDisplay)
                    .replace("{DASHBOARD_URL}", dashboardUrl);

            sendEmail(user.getEmail(), subject, content);
            logNotification(userId, "REGISTRATION_SUCCESS", "Registration successful email sent");
        } catch (Exception e) {
            System.err.println("Failed to send registration success email to user " + userId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getRoleDisplayName(String role) {
        switch (role.toUpperCase()) {
            case "PU":
            case "PUBLIC":
                return "Public User";
            case "PO":
            case "POLICE":
                return "Police Officer";
            case "SW":
            case "SOCIAL_WORKER":
                return "Social Worker";
            case "ADMIN":
                return "Administrator";
            default:
                return role;
        }
    }

    private String generateUserID(String userId, String role) {
        String prefix = "";
        switch (role.toUpperCase()) {
            case "PU":
            case "PUBLIC":
                prefix = "PU-";
                break;
            case "PO":
            case "POLICE":
                prefix = "PO-";
                break;
            case "SW":
            case "SOCIAL_WORKER":
                prefix = "SW-";
                break;
        }
        if (userId.length() >= 4) {
            return prefix + userId.substring(userId.length() - 4).toUpperCase();
        }
        return prefix + userId.toUpperCase();
    }

    private String getDashboardUrl(String role) {
        switch (role.toUpperCase()) {
            case "PU":
            case "PUBLIC":
                return appUrl + "/dashboard/public";
            case "PO":
            case "POLICE":
                return appUrl + "/dashboard";
            case "SW":
            case "SOCIAL_WORKER":
                return appUrl + "/dashboard";
            default:
                return appUrl + "/dashboard";
        }
    }

    public void sendHelpRequestUpdateToAdmin(String requestId, String status, String updatedBy, String trackingId) {
        String subject = "Help Request Update: " + status;
        String content = String.format(
                "<h2>Help Request Updated</h2>" +
                        "<p><strong>Request ID:</strong> %s</p>" +
                        "<p><strong>Status:</strong> %s</p>" +
                        "<p><strong>Updated By:</strong> %s</p>" +
                        "<p><a href='%s/admin/help-requests/%s'>View Request</a></p>",
                trackingId, status, updatedBy, appUrl, requestId);

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            sendEmail(admin.getEmail(), subject, content);
            logNotification(admin.getId(), "HELP_REQUEST_UPDATE_ADMIN",
                    "Help Request " + trackingId + " updated to " + status, "/admin/help-requests/" + requestId);
        }
    }

    public void sendNewMessageNotification(String toUserId, String fromUserId, String fromUserName,
            String messagePreview) {
        String title = "New Message from " + fromUserName;
        String message = messagePreview.length() > 50 ? messagePreview.substring(0, 47) + "..." : messagePreview;
        String actionUrl = "/messages?participantId=" + fromUserId;

        logNotification(toUserId, "NEW_MESSAGE", title, message, actionUrl);
    }
}
