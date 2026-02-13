package com.example.childPortal.service;

import com.example.childPortal.model.*;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Scheduled service for daily follow-up cycle automation.
 * 
 * Daily Process:
 * - Morning (8 AM): Remind SW of today's follow-ups
 * - After Service Time: Request outcome updates
 * - Evening (6 PM): Check incomplete activities
 */
@Service
public class FollowUpSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(FollowUpSchedulerService.class);

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private DailyActivityTrackerRepository dailyActivityTrackerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private NotificationService notificationService;

    /**
     * Morning Reminder Job - Runs at 8:00 AM every day
     * Reminds social workers of their scheduled follow-ups for today.
     */
    @Scheduled(cron = "0 0 8 * * *")  // 8:00 AM every day
    public void sendMorningReminders() {
        logger.info("Running morning reminder job...");
        LocalDate today = LocalDate.now();
        
        try {
            // Get all social workers
            List<User> socialWorkers = userRepository.findByRole(Role.SW);
            
            for (User sw : socialWorkers) {
                // Count today's scheduled services
                int todayCount = countTodayScheduledServices(sw.getId());
                
                if (todayCount > 0 && notificationService != null) {
                    notificationService.createNotification(
                        sw.getId(),
                        "MORNING_REMINDER",
                        "Today's Service Follow-ups",
                        "You have " + todayCount + " service follow-up(s) scheduled for today. View your schedule to manage them.",
                        "/social-worker/dashboard"
                    );
                    
                    logger.info("Sent morning reminder to SW: {} with {} follow-ups", sw.getId(), todayCount);
                }
                
                // Mark morning reminder as sent in daily trackers
                List<DailyActivityTracker> trackers = dailyActivityTrackerRepository
                    .findBySocialWorkerIdAndTrackingDate(sw.getId(), today);
                for (DailyActivityTracker tracker : trackers) {
                    tracker.setMorningReminderSent(true);
                    dailyActivityTrackerRepository.save(tracker);
                }
            }
            
            logger.info("Morning reminder job completed.");
        } catch (Exception e) {
            logger.error("Error in morning reminder job: ", e);
        }
    }

    /**
     * Service Update Request Job - Runs every hour from 10 AM to 6 PM
     * Checks for services whose scheduled time has passed and requests updates.
     */
    @Scheduled(cron = "0 0 10-18 * * *")  // Every hour from 10 AM to 6 PM
    public void requestServiceUpdates() {
        logger.info("Running service update request job...");
        LocalDateTime now = LocalDateTime.now();
        
        try {
            // Get all in-progress help requests
            List<HelpRequest> inProgressRequests = helpRequestRepository.findByStatus(RequestStatus.IN_PROGRESS);
            
            for (HelpRequest request : inProgressRequests) {
                if (request.getAppliedPackageItemExecutions() == null) {
                    continue;
                }
                
                for (ServiceItemExecution execution : request.getAppliedPackageItemExecutions()) {
                    // Check if scheduled time has passed and no outcome recorded
                    if (execution.getScheduledDate() != null &&
                        execution.getScheduledDate().isBefore(now) &&
                        execution.getOutcome() == null &&
                        !"COMPLETED".equals(execution.getStatus()) &&
                        !"PARTIALLY_COMPLETED".equals(execution.getStatus())) {
                        
                        // Check if we've already sent a reminder for this (within last 2 hours)
                        // Using a simple approach - check if notes contain [Reminder Sent]
                        if (execution.getNotes() != null && 
                            execution.getNotes().contains("[Update Requested: " + now.toLocalDate() + "]")) {
                            continue;  // Already sent today
                        }
                        
                        // Send notification to SW
                        if (notificationService != null && request.getAssignedWorkerId() != null) {
                            notificationService.createNotification(
                                request.getAssignedWorkerId(),
                                "SERVICE_UPDATE_NEEDED",
                                "Service Update Required",
                                "Please update the outcome for service '" + execution.getServiceItem() + 
                                    "' (Request: " + request.getTrackingId() + "). The scheduled time has passed.",
                                "/social-worker/requests/" + request.getId()
                            );
                            
                            // Mark that we've requested an update
                            String notes = execution.getNotes() != null ? execution.getNotes() : "";
                            execution.setNotes(notes + "\n[Update Requested: " + now.toLocalDate() + "]");
                            execution.setUpdatedAt(now);
                            helpRequestRepository.save(request);
                            
                            logger.info("Sent update request for service: {} in request: {}", 
                                execution.getServiceItem(), request.getTrackingId());
                        }
                    }
                }
            }
            
            logger.info("Service update request job completed.");
        } catch (Exception e) {
            logger.error("Error in service update request job: ", e);
        }
    }

    /**
     * Evening Check Job - Runs at 6:00 PM every day
     * Checks for incomplete activities and sends reminders/alerts.
     */
    @Scheduled(cron = "0 0 18 * * *")  // 6:00 PM every day
    public void performEveningCheck() {
        logger.info("Running evening check job...");
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        
        try {
            // Get all in-progress help requests
            List<HelpRequest> inProgressRequests = helpRequestRepository.findByStatus(RequestStatus.IN_PROGRESS);
            
            for (HelpRequest request : inProgressRequests) {
                if (request.getAppliedPackageItemExecutions() == null ||
                    request.getAssignedWorkerId() == null) {
                    continue;
                }
                
                // Count incomplete services for today
                long incompleteCount = request.getAppliedPackageItemExecutions().stream()
                    .filter(e -> e.getScheduledDate() != null &&
                                e.getScheduledDate().toLocalDate().equals(today) &&
                                e.getOutcome() == null &&
                                !"COMPLETED".equals(e.getStatus()))
                    .count();
                
                if (incompleteCount > 0 && notificationService != null) {
                    notificationService.createNotification(
                        request.getAssignedWorkerId(),
                        "EVENING_CHECK_INCOMPLETE",
                        "Incomplete Services Alert",
                        "You have " + incompleteCount + " incomplete service(s) for request " + 
                            request.getTrackingId() + ". Please update outcomes or reschedule.",
                        "/social-worker/requests/" + request.getId()
                    );
                    
                    logger.info("Sent evening alert to SW: {} for request: {} with {} incomplete", 
                        request.getAssignedWorkerId(), request.getTrackingId(), incompleteCount);
                }
            }
            
            // Mark evening check as done in daily trackers
            List<DailyActivityTracker> trackers = dailyActivityTrackerRepository
                .findByTrackingDateAndEveningCheckDoneFalse(today);
            for (DailyActivityTracker tracker : trackers) {
                tracker.setEveningCheckDone(true);
                tracker.setUpdatedAt(now);
                dailyActivityTrackerRepository.save(tracker);
            }
            
            logger.info("Evening check job completed.");
        } catch (Exception e) {
            logger.error("Error in evening check job: ", e);
        }
    }

    /**
     * Overdue Follow-up Check - Runs at 9:00 AM every day
     * Marks overdue follow-ups and sends alerts.
     */
    @Scheduled(cron = "0 0 9 * * *")  // 9:00 AM every day
    public void checkOverdueFollowUps() {
        logger.info("Running overdue follow-up check...");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);
        
        try {
            // Get all follow-ups that are past due
            List<FollowUp> allFollowUps = followUpRepository.findByStatus("SCHEDULED");
            
            for (FollowUp followUp : allFollowUps) {
                if (followUp.getScheduledDate() != null &&
                    followUp.getScheduledDate().isBefore(yesterday) &&
                    !"COMPLETED".equals(followUp.getStatus()) &&
                    !"MISSED".equals(followUp.getStatus())) {
                    
                    // Mark as missed
                    followUp.setStatus("MISSED");
                    followUp.setMissedReason("No update provided - automatically marked as missed");
                    followUp.setUpdatedAt(now);
                    followUpRepository.save(followUp);
                    
                    // Notify SW
                    if (notificationService != null && followUp.getSocialWorkerId() != null) {
                        notificationService.createNotification(
                            followUp.getSocialWorkerId(),
                            "FOLLOWUP_MISSED",
                            "Follow-up Marked as Missed",
                            "Follow-up for '" + followUp.getChildName() + "' (" + followUp.getType() + 
                                ") was automatically marked as missed. Please reschedule if needed.",
                            "/social-worker/follow-ups"
                        );
                    }
                    
                    logger.info("Marked follow-up as missed: {} for SW: {}", 
                        followUp.getId(), followUp.getSocialWorkerId());
                }
            }
            
            logger.info("Overdue follow-up check completed.");
        } catch (Exception e) {
            logger.error("Error in overdue follow-up check: ", e);
        }
    }

    /**
     * Weekly Progress Check - Runs every Monday at 9:00 AM
     * Generates weekly progress summaries.
     */
    @Scheduled(cron = "0 0 9 * * MON")  // 9:00 AM every Monday
    public void sendWeeklyProgressSummary() {
        logger.info("Running weekly progress summary job...");
        
        try {
            List<User> socialWorkers = userRepository.findByRole(Role.SW);
            
            for (User sw : socialWorkers) {
                // Count active requests
                List<HelpRequest> activeRequests = helpRequestRepository.findByAssignedWorkerId(sw.getId()).stream()
                    .filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS)
                    .collect(Collectors.toList());
                
                if (activeRequests.isEmpty()) {
                    continue;
                }
                
                // Calculate average progress
                double avgProgress = activeRequests.stream()
                    .mapToInt(r -> r.getProgress() != null ? r.getProgress() : 0)
                    .average()
                    .orElse(0);
                
                // Count services completed this week
                LocalDateTime weekStart = LocalDateTime.now().minusWeeks(1);
                long completedThisWeek = 0;
                for (HelpRequest request : activeRequests) {
                    if (request.getAppliedPackageItemExecutions() != null) {
                        completedThisWeek += request.getAppliedPackageItemExecutions().stream()
                            .filter(e -> e.getCompletedAt() != null && e.getCompletedAt().isAfter(weekStart))
                            .count();
                    }
                }
                
                if (notificationService != null) {
                    notificationService.createNotification(
                        sw.getId(),
                        "WEEKLY_SUMMARY",
                        "Weekly Progress Summary",
                        "This week: " + activeRequests.size() + " active case(s), " +
                            String.format("%.0f", avgProgress) + "% average progress, " +
                            completedThisWeek + " service(s) completed.",
                        "/social-worker/dashboard"
                    );
                }
                
                logger.info("Sent weekly summary to SW: {}", sw.getId());
            }
            
            logger.info("Weekly progress summary job completed.");
        } catch (Exception e) {
            logger.error("Error in weekly progress summary job: ", e);
        }
    }

    /**
     * Helper method to count today's scheduled services for a social worker.
     */
    private int countTodayScheduledServices(String socialWorkerId) {
        LocalDate today = LocalDate.now();
        int count = 0;
        
        List<HelpRequest> requests = helpRequestRepository.findByAssignedWorkerId(socialWorkerId).stream()
            .filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS)
            .collect(Collectors.toList());
        
        for (HelpRequest request : requests) {
            if (request.getAppliedPackageItemExecutions() != null) {
                count += request.getAppliedPackageItemExecutions().stream()
                    .filter(e -> e.getScheduledDate() != null &&
                               e.getScheduledDate().toLocalDate().equals(today) &&
                               !"COMPLETED".equals(e.getStatus()))
                    .count();
            }
        }
        
        return count;
    }
}
