package com.example.childPortal.service;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for managing the service execution workflow after package approval.
 * Handles: Start Service, Resource Assignment, Daily Follow-ups, Service Outcomes,
 * Final Assessment, and Case Completion.
 */
public interface ServiceExecutionService {

    // ==================== START SERVICE ====================
    
    /**
     * Start service execution for a help request.
     * - Changes status to IN_PROGRESS
     * - Sets progress to 10%
     * - Creates timeline log "Service execution started"
     * - Activates follow-up scheduler
     * - Creates initial follow-up (next day)
     * - Creates monitoring checklist
     * - Creates daily activity tracker
     */
    HelpRequestDTO startService(String helpRequestId, String socialWorkerId);
    
    // ==================== RESOURCE ASSIGNMENT ====================
    
    /**
     * Assign resource to a service item.
     * - Updates service item with resource details
     * - Creates follow-up calendar event
     * - Adds reminder to SW dashboard
     * - Updates progress to 25% if all resources assigned
     */
    ResourceAssignment assignResource(String helpRequestId, ResourceAssignmentDTO assignmentDTO, String socialWorkerId);
    
    /**
     * Assign resources to multiple service items at once.
     */
    List<ResourceAssignment> assignResources(String helpRequestId, List<ResourceAssignmentDTO> assignments, String socialWorkerId);
    
    /**
     * Get all resource assignments for a help request.
     */
    List<ResourceAssignment> getResourceAssignments(String helpRequestId);
    
    /**
     * Get resource assignments for a social worker on a specific date.
     */
    List<ResourceAssignment> getResourceAssignmentsByDate(String socialWorkerId, LocalDate date);
    
    /**
     * Reschedule a resource assignment.
     */
    ResourceAssignment rescheduleAssignment(String assignmentId, LocalDate newDate, String newTime, String reason, String socialWorkerId);
    
    // ==================== SERVICE OUTCOME UPDATES ====================
    
    /**
     * Update service item outcome.
     * Handles: COMPLETED_SUCCESSFULLY, PARTIALLY_COMPLETED, NOT_DELIVERED
     * 
     * If Completed Successfully:
     * - Progress +15%
     * - Enable proof upload
     * - Auto-schedule next follow-up (3 days later)
     * 
     * If Partially Completed:
     * - Progress +5%
     * - Prompt for adjustment plan
     * - Schedule follow-up next day
     * 
     * If Not Delivered:
     * - Progress unchanged
     * - Require reschedule
     * - Alert if repeated
     */
    HelpRequestDTO updateServiceOutcome(String helpRequestId, ServiceOutcomeDTO outcomeDTO, String socialWorkerId);
    
    /**
     * Upload proof for a completed service.
     */
    HelpRequestDTO uploadServiceProof(String helpRequestId, String serviceItem, List<String> proofUrls, 
                                       String proofDescription, String socialWorkerId);
    
    /**
     * Create adjustment plan for partially completed service.
     */
    HelpRequestDTO createAdjustmentPlan(String helpRequestId, String serviceItem, 
                                         String adjustmentPlan, String socialWorkerId);
    
    // ==================== DAILY FOLLOW-UP CYCLE ====================
    
    /**
     * Get today's scheduled activities for a social worker.
     * Used for morning dashboard notification.
     */
    DailyActivityTracker getTodayActivities(String socialWorkerId);
    
    /**
     * Get pending service updates for a social worker.
     * Services where scheduled time has passed but no outcome recorded.
     */
    List<ServiceItemExecutionDTO> getPendingServiceUpdates(String socialWorkerId);
    
    /**
     * Get incomplete activities for end-of-day check.
     */
    List<DailyActivityTracker.DailyActivity> getIncompleteActivities(String socialWorkerId, LocalDate date);
    
    /**
     * Mark an activity as attempted (without outcome).
     */
    void markActivityAttempted(String helpRequestId, String serviceItem, String notes, String socialWorkerId);
    
    /**
     * Postpone a scheduled activity.
     */
    void postponeActivity(String helpRequestId, String serviceItem, LocalDate newDate, String reason, String socialWorkerId);
    
    // ==================== MONITORING CHECKLIST ====================
    
    /**
     * Get monitoring checklist for a help request.
     */
    MonitoringChecklist getMonitoringChecklist(String helpRequestId);
    
    /**
     * Update a checklist item status.
     */
    MonitoringChecklist updateChecklistItem(String helpRequestId, String itemId, boolean completed, 
                                             String notes, String socialWorkerId);
    
    // ==================== FINALIZATION ====================
    
    /**
     * Check if case is ready for finalization.
     * Returns true if all services completed and minimum follow-ups done.
     */
    boolean isCaseReadyForFinalization(String helpRequestId);
    
    /**
     * Finalize case - sets progress to 90%.
     * Shows "Finalize Case" button.
     */
    HelpRequestDTO finalizeCase(String helpRequestId, String socialWorkerId);
    
    // ==================== FINAL ASSESSMENT ====================
    
    /**
     * Submit final assessment.
     * - Progress to 100%
     * Form includes: objective achieved, child safe, needs monitoring, recommend closure
     */
    FinalAssessment submitFinalAssessment(String helpRequestId, FinalAssessmentDTO assessmentDTO, String socialWorkerId);
    
    /**
     * Get final assessment for a help request.
     */
    FinalAssessment getFinalAssessment(String helpRequestId);
    
    /**
     * Update draft final assessment.
     */
    FinalAssessment updateFinalAssessment(String assessmentId, FinalAssessmentDTO assessmentDTO, String socialWorkerId);
    
    // ==================== CASE COMPLETION ====================
    
    /**
     * Mark case as completed.
     * - Status to COMPLETED
     * - Enable report generation
     * - Notify admin
     * - Archive follow-up calendar
     * - Close messaging
     */
    HelpRequestDTO markAsCompleted(String helpRequestId, String socialWorkerId);
    
    // ==================== PROGRESS & STATUS ====================
    
    /**
     * Get current service execution status summary.
     */
    ServiceExecutionStatusDTO getExecutionStatus(String helpRequestId);
    
    /**
     * Recalculate and update progress based on current state.
     */
    int recalculateProgress(String helpRequestId);
    
    // ==================== DASHBOARD DATA ====================
    
    /**
     * Get service execution summary for SW dashboard.
     */
    ServiceExecutionDashboardDTO getDashboardData(String socialWorkerId);
    
    /**
     * Get today's follow-up count for a social worker.
     */
    int getTodayFollowUpCount(String socialWorkerId);
    
    /**
     * Get overdue services for a social worker.
     */
    List<ServiceItemExecutionDTO> getOverdueServices(String socialWorkerId);
}
