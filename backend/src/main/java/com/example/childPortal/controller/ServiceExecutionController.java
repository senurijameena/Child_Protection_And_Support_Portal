package com.example.childPortal.controller;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.service.ServiceExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller for service execution workflow endpoints.
 * Handles: Start Service, Resource Assignment, Service Outcomes, Final Assessment, Case Completion.
 */
@RestController
@RequestMapping("/api/service-execution")
public class ServiceExecutionController {

    @Autowired
    private ServiceExecutionService serviceExecutionService;

    // ==================== START SERVICE ====================

    /**
     * Start service execution for a help request.
     * POST /api/service-execution/{helpRequestId}/start
     */
    @PostMapping("/{helpRequestId}/start")
    public ResponseEntity<HelpRequestDTO> startService(
            @PathVariable String helpRequestId,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        HelpRequestDTO result = serviceExecutionService.startService(helpRequestId, userId);
        return ResponseEntity.ok(result);
    }

    // ==================== RESOURCE ASSIGNMENT ====================

    /**
     * Assign resource to a service item.
     * POST /api/service-execution/{helpRequestId}/assign-resource
     */
    @PostMapping("/{helpRequestId}/assign-resource")
    public ResponseEntity<ResourceAssignment> assignResource(
            @PathVariable String helpRequestId,
            @RequestBody ResourceAssignmentDTO assignmentDTO,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        ResourceAssignment result = serviceExecutionService.assignResource(helpRequestId, assignmentDTO, userId);
        return ResponseEntity.ok(result);
    }

    /**
     * Assign resources to multiple service items.
     * POST /api/service-execution/{helpRequestId}/assign-resources
     */
    @PostMapping("/{helpRequestId}/assign-resources")
    public ResponseEntity<List<ResourceAssignment>> assignResources(
            @PathVariable String helpRequestId,
            @RequestBody List<ResourceAssignmentDTO> assignments,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        List<ResourceAssignment> results = serviceExecutionService.assignResources(helpRequestId, assignments, userId);
        return ResponseEntity.ok(results);
    }

    /**
     * Get all resource assignments for a help request.
     * GET /api/service-execution/{helpRequestId}/resources
     */
    @GetMapping("/{helpRequestId}/resources")
    public ResponseEntity<List<ResourceAssignment>> getResourceAssignments(
            @PathVariable String helpRequestId) {
        List<ResourceAssignment> resources = serviceExecutionService.getResourceAssignments(helpRequestId);
        return ResponseEntity.ok(resources);
    }

    /**
     * Get resource assignments for a social worker on a specific date.
     * GET /api/service-execution/resources/by-date?date=2024-02-15
     */
    @GetMapping("/resources/by-date")
    public ResponseEntity<List<ResourceAssignment>> getResourceAssignmentsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        List<ResourceAssignment> resources = serviceExecutionService.getResourceAssignmentsByDate(userId, date);
        return ResponseEntity.ok(resources);
    }

    /**
     * Reschedule a resource assignment.
     * PUT /api/service-execution/resources/{assignmentId}/reschedule
     */
    @PutMapping("/resources/{assignmentId}/reschedule")
    public ResponseEntity<ResourceAssignment> rescheduleAssignment(
            @PathVariable String assignmentId,
            @RequestBody Map<String, Object> rescheduleData,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        LocalDate newDate = LocalDate.parse((String) rescheduleData.get("newDate"));
        String newTime = (String) rescheduleData.get("newTime");
        String reason = (String) rescheduleData.get("reason");
        
        ResourceAssignment result = serviceExecutionService.rescheduleAssignment(assignmentId, newDate, newTime, reason, userId);
        return ResponseEntity.ok(result);
    }

    // ==================== SERVICE OUTCOME UPDATES ====================

    /**
     * Update service item outcome.
     * POST /api/service-execution/{helpRequestId}/update-outcome
     */
    @PostMapping("/{helpRequestId}/update-outcome")
    public ResponseEntity<HelpRequestDTO> updateServiceOutcome(
            @PathVariable String helpRequestId,
            @RequestBody ServiceOutcomeDTO outcomeDTO,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        HelpRequestDTO result = serviceExecutionService.updateServiceOutcome(helpRequestId, outcomeDTO, userId);
        return ResponseEntity.ok(result);
    }

    /**
     * Upload proof for a completed service.
     * POST /api/service-execution/{helpRequestId}/upload-proof
     */
    @PostMapping("/{helpRequestId}/upload-proof")
    public ResponseEntity<HelpRequestDTO> uploadServiceProof(
            @PathVariable String helpRequestId,
            @RequestBody Map<String, Object> proofData,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        String serviceItem = (String) proofData.get("serviceItem");
        @SuppressWarnings("unchecked")
        List<String> proofUrls = (List<String>) proofData.get("proofUrls");
        String proofDescription = (String) proofData.get("proofDescription");
        
        HelpRequestDTO result = serviceExecutionService.uploadServiceProof(helpRequestId, serviceItem, proofUrls, proofDescription, userId);
        return ResponseEntity.ok(result);
    }

    /**
     * Create adjustment plan for partially completed service.
     * POST /api/service-execution/{helpRequestId}/adjustment-plan
     */
    @PostMapping("/{helpRequestId}/adjustment-plan")
    public ResponseEntity<HelpRequestDTO> createAdjustmentPlan(
            @PathVariable String helpRequestId,
            @RequestBody Map<String, String> planData,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        String serviceItem = planData.get("serviceItem");
        String adjustmentPlan = planData.get("adjustmentPlan");
        
        HelpRequestDTO result = serviceExecutionService.createAdjustmentPlan(helpRequestId, serviceItem, adjustmentPlan, userId);
        return ResponseEntity.ok(result);
    }

    // ==================== DAILY FOLLOW-UP CYCLE ====================

    /**
     * Get today's activities for the logged-in social worker.
     * GET /api/service-execution/today-activities
     */
    @GetMapping("/today-activities")
    public ResponseEntity<DailyActivityTracker> getTodayActivities(
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        DailyActivityTracker tracker = serviceExecutionService.getTodayActivities(userId);
        return ResponseEntity.ok(tracker);
    }

    /**
     * Get pending service updates (past scheduled time, no outcome).
     * GET /api/service-execution/pending-updates
     */
    @GetMapping("/pending-updates")
    public ResponseEntity<List<ServiceItemExecutionDTO>> getPendingServiceUpdates(
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        List<ServiceItemExecutionDTO> pending = serviceExecutionService.getPendingServiceUpdates(userId);
        return ResponseEntity.ok(pending);
    }

    /**
     * Get incomplete activities for a specific date.
     * GET /api/service-execution/incomplete-activities?date=2024-02-15
     */
    @GetMapping("/incomplete-activities")
    public ResponseEntity<List<DailyActivityTracker.DailyActivity>> getIncompleteActivities(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        List<DailyActivityTracker.DailyActivity> incomplete = serviceExecutionService.getIncompleteActivities(userId, date);
        return ResponseEntity.ok(incomplete);
    }

    /**
     * Mark an activity as attempted.
     * POST /api/service-execution/{helpRequestId}/mark-attempted
     */
    @PostMapping("/{helpRequestId}/mark-attempted")
    public ResponseEntity<Void> markActivityAttempted(
            @PathVariable String helpRequestId,
            @RequestBody Map<String, String> attemptData,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        String serviceItem = attemptData.get("serviceItem");
        String notes = attemptData.get("notes");
        
        serviceExecutionService.markActivityAttempted(helpRequestId, serviceItem, notes, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Postpone a scheduled activity.
     * POST /api/service-execution/{helpRequestId}/postpone
     */
    @PostMapping("/{helpRequestId}/postpone")
    public ResponseEntity<Void> postponeActivity(
            @PathVariable String helpRequestId,
            @RequestBody Map<String, String> postponeData,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        String serviceItem = postponeData.get("serviceItem");
        LocalDate newDate = LocalDate.parse(postponeData.get("newDate"));
        String reason = postponeData.get("reason");
        
        serviceExecutionService.postponeActivity(helpRequestId, serviceItem, newDate, reason, userId);
        return ResponseEntity.ok().build();
    }

    // ==================== MONITORING CHECKLIST ====================

    /**
     * Get monitoring checklist for a help request.
     * GET /api/service-execution/{helpRequestId}/checklist
     */
    @GetMapping("/{helpRequestId}/checklist")
    public ResponseEntity<MonitoringChecklist> getMonitoringChecklist(
            @PathVariable String helpRequestId) {
        MonitoringChecklist checklist = serviceExecutionService.getMonitoringChecklist(helpRequestId);
        return checklist != null ? ResponseEntity.ok(checklist) : ResponseEntity.notFound().build();
    }

    /**
     * Update a checklist item.
     * PUT /api/service-execution/{helpRequestId}/checklist/{itemId}
     */
    @PutMapping("/{helpRequestId}/checklist/{itemId}")
    public ResponseEntity<MonitoringChecklist> updateChecklistItem(
            @PathVariable String helpRequestId,
            @PathVariable String itemId,
            @RequestBody Map<String, Object> updateData,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        boolean completed = (Boolean) updateData.get("completed");
        String notes = (String) updateData.get("notes");
        
        MonitoringChecklist result = serviceExecutionService.updateChecklistItem(helpRequestId, itemId, completed, notes, userId);
        return ResponseEntity.ok(result);
    }

    // ==================== FINALIZATION ====================

    /**
     * Check if case is ready for finalization.
     * GET /api/service-execution/{helpRequestId}/ready-for-finalization
     */
    @GetMapping("/{helpRequestId}/ready-for-finalization")
    public ResponseEntity<Map<String, Boolean>> isCaseReadyForFinalization(
            @PathVariable String helpRequestId) {
        boolean ready = serviceExecutionService.isCaseReadyForFinalization(helpRequestId);
        return ResponseEntity.ok(Map.of("ready", ready));
    }

    /**
     * Finalize case.
     * POST /api/service-execution/{helpRequestId}/finalize
     */
    @PostMapping("/{helpRequestId}/finalize")
    public ResponseEntity<HelpRequestDTO> finalizeCase(
            @PathVariable String helpRequestId,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        HelpRequestDTO result = serviceExecutionService.finalizeCase(helpRequestId, userId);
        return ResponseEntity.ok(result);
    }

    // ==================== FINAL ASSESSMENT ====================

    /**
     * Submit final assessment.
     * POST /api/service-execution/{helpRequestId}/final-assessment
     */
    @PostMapping("/{helpRequestId}/final-assessment")
    public ResponseEntity<FinalAssessment> submitFinalAssessment(
            @PathVariable String helpRequestId,
            @RequestBody FinalAssessmentDTO assessmentDTO,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        FinalAssessment result = serviceExecutionService.submitFinalAssessment(helpRequestId, assessmentDTO, userId);
        return ResponseEntity.ok(result);
    }

    /**
     * Get final assessment for a help request.
     * GET /api/service-execution/{helpRequestId}/final-assessment
     */
    @GetMapping("/{helpRequestId}/final-assessment")
    public ResponseEntity<FinalAssessment> getFinalAssessment(
            @PathVariable String helpRequestId) {
        FinalAssessment assessment = serviceExecutionService.getFinalAssessment(helpRequestId);
        return assessment != null ? ResponseEntity.ok(assessment) : ResponseEntity.notFound().build();
    }

    /**
     * Update draft final assessment.
     * PUT /api/service-execution/final-assessment/{assessmentId}
     */
    @PutMapping("/final-assessment/{assessmentId}")
    public ResponseEntity<FinalAssessment> updateFinalAssessment(
            @PathVariable String assessmentId,
            @RequestBody FinalAssessmentDTO assessmentDTO,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        FinalAssessment result = serviceExecutionService.updateFinalAssessment(assessmentId, assessmentDTO, userId);
        return ResponseEntity.ok(result);
    }

    // ==================== CASE COMPLETION ====================

    /**
     * Mark case as completed.
     * POST /api/service-execution/{helpRequestId}/complete
     */
    @PostMapping("/{helpRequestId}/complete")
    public ResponseEntity<HelpRequestDTO> markAsCompleted(
            @PathVariable String helpRequestId,
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        HelpRequestDTO result = serviceExecutionService.markAsCompleted(helpRequestId, userId);
        return ResponseEntity.ok(result);
    }

    // ==================== PROGRESS & STATUS ====================

    /**
     * Get service execution status.
     * GET /api/service-execution/{helpRequestId}/status
     */
    @GetMapping("/{helpRequestId}/status")
    public ResponseEntity<ServiceExecutionStatusDTO> getExecutionStatus(
            @PathVariable String helpRequestId) {
        ServiceExecutionStatusDTO status = serviceExecutionService.getExecutionStatus(helpRequestId);
        return ResponseEntity.ok(status);
    }

    /**
     * Recalculate progress.
     * POST /api/service-execution/{helpRequestId}/recalculate-progress
     */
    @PostMapping("/{helpRequestId}/recalculate-progress")
    public ResponseEntity<Map<String, Integer>> recalculateProgress(
            @PathVariable String helpRequestId) {
        int progress = serviceExecutionService.recalculateProgress(helpRequestId);
        return ResponseEntity.ok(Map.of("progress", progress));
    }

    // ==================== DASHBOARD DATA ====================

    /**
     * Get service execution dashboard data.
     * GET /api/service-execution/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ServiceExecutionDashboardDTO> getDashboardData(
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        ServiceExecutionDashboardDTO dashboard = serviceExecutionService.getDashboardData(userId);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Get today's follow-up count.
     * GET /api/service-execution/today-followup-count
     */
    @GetMapping("/today-followup-count")
    public ResponseEntity<Map<String, Integer>> getTodayFollowUpCount(
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        int count = serviceExecutionService.getTodayFollowUpCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Get overdue services.
     * GET /api/service-execution/overdue-services
     */
    @GetMapping("/overdue-services")
    public ResponseEntity<List<ServiceItemExecutionDTO>> getOverdueServices(
            @AuthenticationPrincipal String userId) {
        userId = resolveUserId(userId);
        List<ServiceItemExecutionDTO> overdue = serviceExecutionService.getOverdueServices(userId);
        return ResponseEntity.ok(overdue);
    }

    // ==================== HELPER METHODS ====================

    private String resolveUserId(String userId) {
        if (userId == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                return auth.getName();
            }
        }
        return userId;
    }
}
