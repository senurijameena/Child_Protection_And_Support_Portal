package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.repository.*;
import com.example.childPortal.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ServiceExecutionServiceImpl implements ServiceExecutionService {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private ResourceAssignmentRepository resourceAssignmentRepository;

    @Autowired
    private MonitoringChecklistRepository monitoringChecklistRepository;

    @Autowired
    private DailyActivityTrackerRepository dailyActivityTrackerRepository;

    @Autowired
    private FinalAssessmentRepository finalAssessmentRepository;

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private NotificationService notificationService;

    @Autowired(required = false)
    private CaseTimelineService timelineService;

    // ==================== START SERVICE ====================

    @Override
    public HelpRequestDTO startService(String helpRequestId, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        // Validate state
        if (!"ACCEPTED".equals(request.getAppliedServicePackageStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Service package must be accepted before starting service");
        }
        
        if (request.isServiceStarted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service has already been started");
        }
        
        // Update request
        request.setStatus(RequestStatus.IN_PROGRESS);
        request.setProgress(10);
        request.setServiceStarted(true);
        request.setServiceStartedAt(LocalDateTime.now());
        request.setLastUpdated(LocalDateTime.now());
        
        // Create initial follow-up (next day)
        createInitialFollowUp(request, socialWorkerId);
        
        // Create monitoring checklist
        createMonitoringChecklist(request, socialWorkerId);
        
        // Create daily activity tracker for today
        createOrUpdateDailyTracker(request, socialWorkerId, LocalDate.now());
        
        HelpRequest saved = helpRequestRepository.save(request);
        
        // Timeline event
        if (timelineService != null) {
            User sw = userRepository.findById(socialWorkerId).orElse(null);
            String swName = sw != null ? sw.getFullName() : "Social Worker";
            CaseTimelineDTO timeline = new CaseTimelineDTO();
            timeline.setHelpRequestId(helpRequestId);
            timeline.setEventType(CaseTimelineEvent.EventType.SERVICE_EXECUTION_STARTED);
            timeline.setTitle("Service Execution Started");
            timeline.setDescription("Service execution started. Progress: 10%");
            timeline.setPerformedByUserId(socialWorkerId);
            timeline.setPerformedByName(swName);
            timeline.setPerformedByRole("SW");
            timelineService.createTimelineEvent(timeline);
        }
        
        // Notify requester
        if (notificationService != null && request.getRequesterUserId() != null) {
            notificationService.createNotification(
                request.getRequesterUserId(),
                "SERVICE_STARTED",
                "Service Started",
                "Service execution has started for your help request " + request.getTrackingId(),
                "/dashboard/requests/" + helpRequestId
            );
        }
        
        return convertToDTO(saved);
    }

    // ==================== RESOURCE ASSIGNMENT ====================

    @Override
    public ResourceAssignment assignResource(String helpRequestId, ResourceAssignmentDTO dto, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        if (!request.isServiceStarted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service must be started before assigning resources");
        }
        
        // Find the service item in the executions list
        List<ServiceItemExecution> executions = request.getAppliedPackageItemExecutions();
        if (executions == null || dto.getServiceItemIndex() >= executions.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid service item index");
        }
        
        ServiceItemExecution execution = executions.get(dto.getServiceItemIndex());
        
        // Update service item execution
        execution.setAssignedResource(dto.getResourceName());
        execution.setResourceOrganization(dto.getResourceOrganization());
        execution.setScheduledDate(dto.getScheduledDate() != null ? 
            dto.getScheduledDate().atStartOfDay() : null);
        if (dto.getScheduledTime() != null) {
            execution.setScheduledTime(LocalTime.parse(dto.getScheduledTime()));
        }
        execution.setStatus("SCHEDULED");
        execution.setNotes(dto.getAssignmentNotes());
        execution.setUpdatedAt(LocalDateTime.now());
        
        // Create ResourceAssignment record
        ResourceAssignment assignment = new ResourceAssignment();
        assignment.setHelpRequestId(helpRequestId);
        assignment.setSocialWorkerId(socialWorkerId);
        assignment.setServiceItem(dto.getServiceItem());
        assignment.setServiceItemIndex(dto.getServiceItemIndex());
        assignment.setResourceName(dto.getResourceName());
        assignment.setResourceOrganization(dto.getResourceOrganization());
        assignment.setResourceContactPerson(dto.getResourceContactPerson());
        assignment.setResourcePhone(dto.getResourcePhone());
        assignment.setResourceEmail(dto.getResourceEmail());
        assignment.setResourceAddress(dto.getResourceAddress());
        assignment.setScheduledDate(dto.getScheduledDate());
        if (dto.getScheduledTime() != null) {
            assignment.setScheduledTime(LocalTime.parse(dto.getScheduledTime()));
        }
        assignment.setEstimatedDurationMinutes(dto.getEstimatedDurationMinutes());
        assignment.setLocation(dto.getLocation());
        assignment.setAssignmentNotes(dto.getAssignmentNotes());
        assignment.setSpecialInstructions(dto.getSpecialInstructions());
        assignment.setCreatedBy(socialWorkerId);
        
        ResourceAssignment savedAssignment = resourceAssignmentRepository.save(assignment);
        
        // Create follow-up for the scheduled service
        FollowUp followUp = createServiceFollowUp(request, execution, dto.getScheduledDate(), socialWorkerId);
        if (followUp != null) {
            execution.setFollowUpId(followUp.getId());
            savedAssignment.setFollowUpId(followUp.getId());
            savedAssignment.setAddedToCalendar(true);
            savedAssignment.setReminderCreated(true);
            resourceAssignmentRepository.save(savedAssignment);
        }
        
        // Check if all services have resources assigned
        boolean allAssigned = executions.stream()
            .allMatch(e -> e.getAssignedResource() != null && !e.getAssignedResource().isEmpty());
        
        if (allAssigned && !request.isResourcesAssigned()) {
            request.setResourcesAssigned(true);
            request.setProgress(25);
        }
        
        request.setLastUpdated(LocalDateTime.now());
        helpRequestRepository.save(request);
        
        // Timeline event
        if (timelineService != null) {
            User sw = userRepository.findById(socialWorkerId).orElse(null);
            String swName = sw != null ? sw.getFullName() : "Social Worker";
            CaseTimelineDTO timeline = new CaseTimelineDTO();
            timeline.setHelpRequestId(helpRequestId);
            timeline.setEventType(CaseTimelineEvent.EventType.SERVICE_EXECUTION_RESOURCE_ASSIGNED);
            timeline.setTitle("Resource Assigned");
            timeline.setDescription("Resource '" + dto.getResourceName() + "' assigned to service: " + dto.getServiceItem() +
                " scheduled for " + dto.getScheduledDate());
            timeline.setPerformedByUserId(socialWorkerId);
            timeline.setPerformedByName(swName);
            timeline.setPerformedByRole("SW");
            timelineService.createTimelineEvent(timeline);
        }
        
        return savedAssignment;
    }

    @Override
    public List<ResourceAssignment> assignResources(String helpRequestId, List<ResourceAssignmentDTO> assignments, String socialWorkerId) {
        List<ResourceAssignment> results = new ArrayList<>();
        for (ResourceAssignmentDTO dto : assignments) {
            results.add(assignResource(helpRequestId, dto, socialWorkerId));
        }
        return results;
    }

    @Override
    public List<ResourceAssignment> getResourceAssignments(String helpRequestId) {
        return resourceAssignmentRepository.findByHelpRequestId(helpRequestId);
    }

    @Override
    public List<ResourceAssignment> getResourceAssignmentsByDate(String socialWorkerId, LocalDate date) {
        return resourceAssignmentRepository.findBySocialWorkerIdAndScheduledDate(socialWorkerId, date);
    }

    @Override
    public ResourceAssignment rescheduleAssignment(String assignmentId, LocalDate newDate, String newTime, 
                                                    String reason, String socialWorkerId) {
        ResourceAssignment assignment = resourceAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        
        HelpRequest request = getHelpRequestOrThrow(assignment.getHelpRequestId());
        
        // Update the service item execution
        List<ServiceItemExecution> executions = request.getAppliedPackageItemExecutions();
        if (executions != null && assignment.getServiceItemIndex() < executions.size()) {
            ServiceItemExecution execution = executions.get(assignment.getServiceItemIndex());
            if (execution.getOriginalScheduledDate() == null) {
                execution.setOriginalScheduledDate(execution.getScheduledDate());
            }
            execution.setScheduledDate(newDate.atStartOfDay());
            if (newTime != null) {
                execution.setScheduledTime(LocalTime.parse(newTime));
            }
            execution.setRescheduleCount(execution.getRescheduleCount() + 1);
            execution.setLastRescheduleReason(reason);
            execution.setStatus("RESCHEDULED");
            execution.setUpdatedAt(LocalDateTime.now());
        }
        
        // Update assignment
        assignment.setScheduledDate(newDate);
        if (newTime != null) {
            assignment.setScheduledTime(LocalTime.parse(newTime));
        }
        assignment.setStatus("RESCHEDULED");
        assignment.setUpdatedAt(LocalDateTime.now());
        
        request.setLastUpdated(LocalDateTime.now());
        helpRequestRepository.save(request);
        
        return resourceAssignmentRepository.save(assignment);
    }

    // ==================== SERVICE OUTCOME UPDATES ====================

    @Override
    public HelpRequestDTO updateServiceOutcome(String helpRequestId, ServiceOutcomeDTO dto, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        List<ServiceItemExecution> executions = request.getAppliedPackageItemExecutions();
        if (executions == null || dto.getServiceItemIndex() >= executions.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid service item index");
        }
        
        ServiceItemExecution execution = executions.get(dto.getServiceItemIndex());
        execution.setOutcome(dto.getOutcome());
        execution.setOutcomeReason(dto.getOutcomeReason());
        execution.setOutcomeNotes(dto.getOutcomeNotes());
        execution.setOutcomeRecordedAt(LocalDateTime.now());
        execution.setOutcomeRecordedBy(socialWorkerId);
        execution.setUpdatedAt(LocalDateTime.now());
        
        int currentProgress = request.getProgress() != null ? request.getProgress() : 0;
        CaseTimelineEvent.EventType eventType;
        String eventTitle;
        String eventDescription;
        
        switch (dto.getOutcome()) {
            case "COMPLETED_SUCCESSFULLY":
                execution.setStatus("COMPLETED");
                execution.setCompletedAt(LocalDateTime.now());
                execution.setProgressContribution(15);
                currentProgress += 15;
                
                // Set proof if provided
                if (dto.getProofUrls() != null) {
                    execution.setProofUrls(dto.getProofUrls());
                    execution.setProofDescription(dto.getProofDescription());
                }
                
                // Auto-schedule next follow-up (3 days later)
                createNextFollowUp(request, execution, 3, socialWorkerId);
                
                eventType = CaseTimelineEvent.EventType.SERVICE_ITEM_COMPLETED;
                eventTitle = "Service Completed Successfully";
                eventDescription = "Service '" + execution.getServiceItem() + "' completed successfully. Progress +" + 15 + "%";
                break;
                
            case "PARTIALLY_COMPLETED":
                execution.setStatus("PARTIALLY_COMPLETED");
                execution.setProgressContribution(5);
                currentProgress += 5;
                execution.setAdjustmentRequired(true);
                
                if (dto.getAdjustmentPlan() != null) {
                    execution.setAdjustmentPlan(dto.getAdjustmentPlan());
                }
                
                // Schedule follow-up next day
                createNextFollowUp(request, execution, 1, socialWorkerId);
                
                eventType = CaseTimelineEvent.EventType.SERVICE_ITEM_PARTIALLY_COMPLETED;
                eventTitle = "Service Partially Completed";
                eventDescription = "Service '" + execution.getServiceItem() + "' partially completed. Adjustment plan required.";
                break;
                
            case "NOT_DELIVERED":
                execution.setStatus("NOT_DELIVERED");
                // Progress unchanged
                
                // Handle rescheduling
                if (dto.getNewScheduledDate() != null) {
                    if (execution.getOriginalScheduledDate() == null) {
                        execution.setOriginalScheduledDate(execution.getScheduledDate());
                    }
                    execution.setScheduledDate(dto.getNewScheduledDate().atStartOfDay());
                    if (dto.getNewScheduledTime() != null) {
                        execution.setScheduledTime(LocalTime.parse(dto.getNewScheduledTime()));
                    }
                    execution.setRescheduleCount(execution.getRescheduleCount() + 1);
                    execution.setLastRescheduleReason(dto.getRescheduleReason());
                    execution.setStatus("RESCHEDULED");
                }
                
                // Alert if repeated failures
                if (execution.getRescheduleCount() >= 3) {
                    // Create alert notification
                    if (notificationService != null) {
                        notificationService.createNotification(
                            socialWorkerId,
                            "SERVICE_REPEATED_FAILURE",
                            "Repeated Service Delivery Issue",
                            "Service '" + execution.getServiceItem() + "' has been rescheduled " + 
                                execution.getRescheduleCount() + " times. Please review and take action.",
                            "/social-worker/requests/" + helpRequestId
                        );
                    }
                }
                
                eventType = CaseTimelineEvent.EventType.SERVICE_ITEM_NOT_DELIVERED;
                eventTitle = "Service Not Delivered";
                eventDescription = "Service '" + execution.getServiceItem() + "' not delivered. Reason: " + 
                    dto.getOutcomeReason();
                break;
                
            default:
                eventType = CaseTimelineEvent.EventType.SERVICE_EXECUTION_PROGRESS_UPDATED;
                eventTitle = "Service Updated";
                eventDescription = "Service '" + execution.getServiceItem() + "' updated: " + dto.getOutcome();
        }
        
        // Cap progress at 85% until finalization
        request.setProgress(Math.min(currentProgress, 85));
        
        // Check if all services are completed
        checkAllServicesCompleted(request);
        
        request.setLastUpdated(LocalDateTime.now());
        HelpRequest saved = helpRequestRepository.save(request);
        
        // Timeline event
        if (timelineService != null) {
            User sw = userRepository.findById(socialWorkerId).orElse(null);
            String swName = sw != null ? sw.getFullName() : "Social Worker";
            CaseTimelineDTO timeline = new CaseTimelineDTO();
            timeline.setHelpRequestId(helpRequestId);
            timeline.setEventType(eventType);
            timeline.setTitle(eventTitle);
            timeline.setDescription(eventDescription);
            timeline.setPerformedByUserId(socialWorkerId);
            timeline.setPerformedByName(swName);
            timeline.setPerformedByRole("SW");
            timelineService.createTimelineEvent(timeline);
        }
        
        return convertToDTO(saved);
    }

    @Override
    public HelpRequestDTO uploadServiceProof(String helpRequestId, String serviceItem, List<String> proofUrls,
                                              String proofDescription, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        List<ServiceItemExecution> executions = request.getAppliedPackageItemExecutions();
        if (executions != null) {
            for (ServiceItemExecution execution : executions) {
                if (execution.getServiceItem().equals(serviceItem)) {
                    execution.setProofUrls(proofUrls);
                    execution.setProofDescription(proofDescription);
                    execution.setUpdatedAt(LocalDateTime.now());
                    break;
                }
            }
        }
        
        request.setLastUpdated(LocalDateTime.now());
        return convertToDTO(helpRequestRepository.save(request));
    }

    @Override
    public HelpRequestDTO createAdjustmentPlan(String helpRequestId, String serviceItem,
                                                String adjustmentPlan, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        List<ServiceItemExecution> executions = request.getAppliedPackageItemExecutions();
        if (executions != null) {
            for (ServiceItemExecution execution : executions) {
                if (execution.getServiceItem().equals(serviceItem)) {
                    execution.setAdjustmentPlan(adjustmentPlan);
                    execution.setAdjustmentRequired(false);
                    execution.setUpdatedAt(LocalDateTime.now());
                    break;
                }
            }
        }
        
        request.setLastUpdated(LocalDateTime.now());
        return convertToDTO(helpRequestRepository.save(request));
    }

    // ==================== DAILY FOLLOW-UP CYCLE ====================

    @Override
    public DailyActivityTracker getTodayActivities(String socialWorkerId) {
        LocalDate today = LocalDate.now();
        
        // Get all in-progress requests for this SW
        List<HelpRequest> requests = helpRequestRepository.findByAssignedWorkerId(socialWorkerId).stream()
            .filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS)
            .collect(Collectors.toList());
        
        // Create/get consolidated daily tracker
        DailyActivityTracker tracker = new DailyActivityTracker();
        tracker.setSocialWorkerId(socialWorkerId);
        tracker.setTrackingDate(today);
        
        List<DailyActivityTracker.DailyActivity> activities = new ArrayList<>();
        List<DailyActivityTracker.ScheduledService> scheduledServices = new ArrayList<>();
        
        for (HelpRequest request : requests) {
            if (request.getAppliedPackageItemExecutions() != null) {
                for (ServiceItemExecution execution : request.getAppliedPackageItemExecutions()) {
                    if (execution.getScheduledDate() != null && 
                        execution.getScheduledDate().toLocalDate().equals(today) &&
                        !"COMPLETED".equals(execution.getStatus())) {
                        
                        DailyActivityTracker.ScheduledService service = new DailyActivityTracker.ScheduledService();
                        service.setServiceItem(execution.getServiceItem());
                        service.setResource(execution.getAssignedResource());
                        service.setScheduledDateTime(execution.getScheduledDate());
                        service.setStatus(execution.getOutcome() == null ? "PENDING" : "AWAITING_UPDATE");
                        scheduledServices.add(service);
                    }
                }
            }
        }
        
        tracker.setScheduledServices(scheduledServices);
        tracker.setTotalScheduled(scheduledServices.size());
        tracker.updateCounts();
        
        return tracker;
    }

    @Override
    public List<ServiceItemExecutionDTO> getPendingServiceUpdates(String socialWorkerId) {
        LocalDateTime now = LocalDateTime.now();
        List<ServiceItemExecutionDTO> pending = new ArrayList<>();
        
        List<HelpRequest> requests = helpRequestRepository.findByAssignedWorkerId(socialWorkerId).stream()
            .filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS)
            .collect(Collectors.toList());
        
        for (HelpRequest request : requests) {
            if (request.getAppliedPackageItemExecutions() != null) {
                int index = 0;
                for (ServiceItemExecution execution : request.getAppliedPackageItemExecutions()) {
                    if (execution.getScheduledDate() != null &&
                        execution.getScheduledDate().isBefore(now) &&
                        execution.getOutcome() == null &&
                        !"COMPLETED".equals(execution.getStatus())) {
                        
                        ServiceItemExecutionDTO dto = convertExecutionToDTO(execution, index);
                        dto.setHelpRequestId(request.getId());
                        dto.setTrackingId(request.getTrackingId());
                        pending.add(dto);
                    }
                    index++;
                }
            }
        }
        
        return pending;
    }

    @Override
    public List<DailyActivityTracker.DailyActivity> getIncompleteActivities(String socialWorkerId, LocalDate date) {
        Optional<DailyActivityTracker> tracker = dailyActivityTrackerRepository
            .findBySocialWorkerIdAndTrackingDate(socialWorkerId, date).stream().findFirst();
        
        if (tracker.isPresent()) {
            return tracker.get().getActivities().stream()
                .filter(a -> !"COMPLETED".equals(a.getStatus()))
                .collect(Collectors.toList());
        }
        
        return new ArrayList<>();
    }

    @Override
    public void markActivityAttempted(String helpRequestId, String serviceItem, String notes, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        if (request.getAppliedPackageItemExecutions() != null) {
            for (ServiceItemExecution execution : request.getAppliedPackageItemExecutions()) {
                if (execution.getServiceItem().equals(serviceItem)) {
                    execution.setNotes(execution.getNotes() != null ? 
                        execution.getNotes() + "\n[Attempted] " + notes : "[Attempted] " + notes);
                    execution.setUpdatedAt(LocalDateTime.now());
                    break;
                }
            }
        }
        
        request.setLastUpdated(LocalDateTime.now());
        helpRequestRepository.save(request);
    }

    @Override
    public void postponeActivity(String helpRequestId, String serviceItem, LocalDate newDate, 
                                  String reason, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        if (request.getAppliedPackageItemExecutions() != null) {
            for (ServiceItemExecution execution : request.getAppliedPackageItemExecutions()) {
                if (execution.getServiceItem().equals(serviceItem)) {
                    if (execution.getOriginalScheduledDate() == null) {
                        execution.setOriginalScheduledDate(execution.getScheduledDate());
                    }
                    execution.setScheduledDate(newDate.atStartOfDay());
                    execution.setRescheduleCount(execution.getRescheduleCount() + 1);
                    execution.setLastRescheduleReason(reason);
                    execution.setUpdatedAt(LocalDateTime.now());
                    break;
                }
            }
        }
        
        request.setLastUpdated(LocalDateTime.now());
        helpRequestRepository.save(request);
    }

    // ==================== MONITORING CHECKLIST ====================

    @Override
    public MonitoringChecklist getMonitoringChecklist(String helpRequestId) {
        return monitoringChecklistRepository.findByHelpRequestId(helpRequestId).orElse(null);
    }

    @Override
    public MonitoringChecklist updateChecklistItem(String helpRequestId, String itemId, boolean completed,
                                                    String notes, String socialWorkerId) {
        MonitoringChecklist checklist = monitoringChecklistRepository.findByHelpRequestId(helpRequestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Checklist not found"));
        
        for (MonitoringChecklist.ChecklistItem item : checklist.getItems()) {
            if (item.getItemId().equals(itemId)) {
                item.setCompleted(completed);
                item.setCompletedBy(socialWorkerId);
                item.setCompletedAt(completed ? LocalDateTime.now() : null);
                item.setNotes(notes);
                break;
            }
        }
        
        checklist.updateCompletionCount();
        return monitoringChecklistRepository.save(checklist);
    }

    // ==================== FINALIZATION ====================

    @Override
    public boolean isCaseReadyForFinalization(String helpRequestId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        if (request.getAppliedPackageItemExecutions() == null) {
            return false;
        }
        
        // Check if all services are completed
        boolean allCompleted = request.getAppliedPackageItemExecutions().stream()
            .allMatch(e -> "COMPLETED".equals(e.getStatus()) || "PARTIALLY_COMPLETED".equals(e.getStatus()));
        
        if (!allCompleted) {
            return false;
        }
        
        // Check minimum follow-ups (at least 3)
        List<FollowUp> followUps = followUpRepository.findByHelpRequestId(helpRequestId);
        long completedFollowUps = followUps.stream()
            .filter(f -> "COMPLETED".equals(f.getStatus()))
            .count();
        
        return completedFollowUps >= 3;
    }

    @Override
    public HelpRequestDTO finalizeCase(String helpRequestId, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        if (!isCaseReadyForFinalization(helpRequestId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Case is not ready for finalization. Ensure all services are completed and minimum follow-ups are done.");
        }
        
        request.setProgress(90);
        request.setAllServicesCompleted(true);
        request.setServiceFinalizedAt(LocalDateTime.now());
        request.setCaseFinalized(true);
        request.setLastUpdated(LocalDateTime.now());
        
        HelpRequest saved = helpRequestRepository.save(request);
        
        // Timeline event
        if (timelineService != null) {
            User sw = userRepository.findById(socialWorkerId).orElse(null);
            String swName = sw != null ? sw.getFullName() : "Social Worker";
            CaseTimelineDTO timeline = new CaseTimelineDTO();
            timeline.setHelpRequestId(helpRequestId);
            timeline.setEventType(CaseTimelineEvent.EventType.SERVICE_EXECUTION_FINALIZED);
            timeline.setTitle("Case Finalized");
            timeline.setDescription("All services completed. Case ready for final assessment. Progress: 90%");
            timeline.setPerformedByUserId(socialWorkerId);
            timeline.setPerformedByName(swName);
            timeline.setPerformedByRole("SW");
            timelineService.createTimelineEvent(timeline);
        }
        
        return convertToDTO(saved);
    }

    // ==================== FINAL ASSESSMENT ====================

    @Override
    public FinalAssessment submitFinalAssessment(String helpRequestId, FinalAssessmentDTO dto, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        if (!request.isCaseFinalized()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Case must be finalized before submitting final assessment");
        }
        
        User sw = userRepository.findById(socialWorkerId).orElse(null);
        String swName = sw != null ? sw.getFullName() : "Social Worker";
        
        // Check if assessment already exists
        FinalAssessment assessment = finalAssessmentRepository.findByHelpRequestId(helpRequestId)
            .orElse(new FinalAssessment());
        
        assessment.setHelpRequestId(helpRequestId);
        assessment.setSocialWorkerId(socialWorkerId);
        assessment.setSocialWorkerName(swName);
        assessment.setObjectiveAchieved(dto.isObjectiveAchieved());
        assessment.setObjectiveAchievedDetails(dto.getObjectiveAchievedDetails());
        assessment.setChildSafe(dto.isChildSafe());
        assessment.setChildSafetyDetails(dto.getChildSafetyDetails());
        assessment.setChildSafetyRating(dto.getChildSafetyRating());
        assessment.setNeedsContinuedMonitoring(dto.isNeedsContinuedMonitoring());
        assessment.setMonitoringPlan(dto.getMonitoringPlan());
        assessment.setMonitoringDurationMonths(dto.getMonitoringDurationMonths());
        assessment.setRecommendClosure(dto.isRecommendClosure());
        assessment.setClosureRecommendationReason(dto.getClosureRecommendationReason());
        assessment.setOverallProgressScore(dto.getOverallProgressScore());
        assessment.setFamilySupportScore(dto.getFamilySupportScore());
        assessment.setChildWellbeingScore(dto.getChildWellbeingScore());
        assessment.setServiceEffectivenessScore(dto.getServiceEffectivenessScore());
        assessment.setOverallSummary(dto.getOverallSummary());
        assessment.setAchievedOutcomes(dto.getAchievedOutcomes());
        assessment.setRemainingConcerns(dto.getRemainingConcerns());
        assessment.setRecommendedNextSteps(dto.getRecommendedNextSteps());
        assessment.setLessonsLearned(dto.getLessonsLearned());
        assessment.setAttachmentUrls(dto.getAttachmentUrls());
        assessment.setSignedOff(dto.isSignedOff());
        assessment.setDigitalSignature(dto.getDigitalSignature());
        
        if (dto.isSignedOff()) {
            assessment.setSignedOffAt(LocalDateTime.now());
            assessment.setSignedOffBy(socialWorkerId);
            assessment.setStatus("SUBMITTED");
            assessment.setSubmittedAt(LocalDateTime.now());
            
            // Update help request
            request.setProgress(100);
            request.setFinalAssessmentCompleted(true);
            request.setFinalAssessmentAt(LocalDateTime.now());
            request.setLastUpdated(LocalDateTime.now());
            helpRequestRepository.save(request);
        } else {
            assessment.setStatus("DRAFT");
        }
        
        assessment.setUpdatedAt(LocalDateTime.now());
        FinalAssessment saved = finalAssessmentRepository.save(assessment);
        
        // Timeline event
        if (timelineService != null && dto.isSignedOff()) {
            CaseTimelineDTO timeline = new CaseTimelineDTO();
            timeline.setHelpRequestId(helpRequestId);
            timeline.setEventType(CaseTimelineEvent.EventType.FINAL_ASSESSMENT_SUBMITTED);
            timeline.setTitle("Final Assessment Submitted");
            timeline.setDescription("Final assessment submitted and signed off. Progress: 100%");
            timeline.setPerformedByUserId(socialWorkerId);
            timeline.setPerformedByName(swName);
            timeline.setPerformedByRole("SW");
            timelineService.createTimelineEvent(timeline);
        }
        
        return saved;
    }

    @Override
    public FinalAssessment getFinalAssessment(String helpRequestId) {
        return finalAssessmentRepository.findByHelpRequestId(helpRequestId).orElse(null);
    }

    @Override
    public FinalAssessment updateFinalAssessment(String assessmentId, FinalAssessmentDTO dto, String socialWorkerId) {
        FinalAssessment assessment = finalAssessmentRepository.findById(assessmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));
        
        // Only allow updates if not yet submitted
        if ("SUBMITTED".equals(assessment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update submitted assessment");
        }
        
        return submitFinalAssessment(assessment.getHelpRequestId(), dto, socialWorkerId);
    }

    // ==================== CASE COMPLETION ====================

    @Override
    public HelpRequestDTO markAsCompleted(String helpRequestId, String socialWorkerId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        if (!request.isFinalAssessmentCompleted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Final assessment must be completed before marking case as completed");
        }
        
        request.setStatus(RequestStatus.COMPLETED);
        request.setCompletionDate(LocalDateTime.now());
        request.setLastUpdated(LocalDateTime.now());
        
        HelpRequest saved = helpRequestRepository.save(request);
        
        // Archive follow-ups
        List<FollowUp> followUps = followUpRepository.findByHelpRequestId(helpRequestId);
        for (FollowUp followUp : followUps) {
            if (!"COMPLETED".equals(followUp.getStatus())) {
                followUp.setStatus("ARCHIVED");
                followUp.setUpdatedAt(LocalDateTime.now());
                followUpRepository.save(followUp);
            }
        }
        
        // Notify admin
        if (notificationService != null) {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(
                    admin.getId(),
                    "CASE_COMPLETED",
                    "Help Request Completed",
                    "Help request " + request.getTrackingId() + " has been marked as completed.",
                    "/admin/requests/" + helpRequestId
                );
            }
        }
        
        // Notify requester
        if (notificationService != null && request.getRequesterUserId() != null) {
            notificationService.createNotification(
                request.getRequesterUserId(),
                "REQUEST_COMPLETED",
                "Your Help Request Completed",
                "Your help request " + request.getTrackingId() + " has been completed. You may provide feedback.",
                "/dashboard/requests/" + helpRequestId
            );
        }
        
        // Timeline event
        if (timelineService != null) {
            User sw = userRepository.findById(socialWorkerId).orElse(null);
            String swName = sw != null ? sw.getFullName() : "Social Worker";
            CaseTimelineDTO timeline = new CaseTimelineDTO();
            timeline.setHelpRequestId(helpRequestId);
            timeline.setEventType(CaseTimelineEvent.EventType.CASE_MARKED_COMPLETED);
            timeline.setTitle("Case Completed");
            timeline.setDescription("Case has been marked as completed. Report generation enabled.");
            timeline.setPerformedByUserId(socialWorkerId);
            timeline.setPerformedByName(swName);
            timeline.setPerformedByRole("SW");
            timelineService.createTimelineEvent(timeline);
        }
        
        return convertToDTO(saved);
    }

    // ==================== PROGRESS & STATUS ====================

    @Override
    public ServiceExecutionStatusDTO getExecutionStatus(String helpRequestId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        ServiceExecutionStatusDTO status = new ServiceExecutionStatusDTO();
        status.setHelpRequestId(request.getId());
        status.setTrackingId(request.getTrackingId());
        status.setStatus(request.getStatus().name());
        status.setProgress(request.getProgress() != null ? request.getProgress() : 0);
        status.setServiceStarted(request.isServiceStarted());
        status.setResourcesAssigned(request.isResourcesAssigned());
        status.setAllServicesCompleted(request.isAllServicesCompleted());
        status.setFinalAssessmentCompleted(request.isFinalAssessmentCompleted());
        status.setCaseFinalized(request.isCaseFinalized());
        status.setServiceStartedAt(request.getServiceStartedAt());
        status.setServiceFinalizedAt(request.getServiceFinalizedAt());
        status.setFinalAssessmentAt(request.getFinalAssessmentAt());
        status.setCompletedAt(request.getCompletionDate());
        
        // Count service items
        List<ServiceItemExecution> executions = request.getAppliedPackageItemExecutions();
        if (executions != null) {
            status.setTotalServices(executions.size());
            status.setCompletedServices((int) executions.stream().filter(e -> "COMPLETED".equals(e.getStatus())).count());
            status.setPartiallyCompletedServices((int) executions.stream().filter(e -> "PARTIALLY_COMPLETED".equals(e.getStatus())).count());
            status.setScheduledServices((int) executions.stream().filter(e -> "SCHEDULED".equals(e.getStatus())).count());
            status.setPendingServices((int) executions.stream().filter(e -> "PENDING".equals(e.getStatus())).count());
            
            // Build service item status list
            List<ServiceExecutionStatusDTO.ServiceItemStatusDTO> items = new ArrayList<>();
            int index = 0;
            for (ServiceItemExecution execution : executions) {
                ServiceExecutionStatusDTO.ServiceItemStatusDTO item = new ServiceExecutionStatusDTO.ServiceItemStatusDTO();
                item.setServiceItem(execution.getServiceItem());
                item.setIndex(index++);
                item.setStatus(execution.getStatus());
                item.setOutcome(execution.getOutcome());
                item.setAssignedResource(execution.getAssignedResource());
                item.setResourceOrganization(execution.getResourceOrganization());
                item.setScheduledDate(execution.getScheduledDate());
                item.setScheduledTime(execution.getScheduledTime() != null ? execution.getScheduledTime().toString() : null);
                item.setProgressContribution(execution.getProgressContribution() != null ? execution.getProgressContribution() : 0);
                item.setHasProof(execution.getProofUrls() != null && !execution.getProofUrls().isEmpty());
                item.setRescheduleCount(execution.getRescheduleCount());
                items.add(item);
            }
            status.setServiceItems(items);
        }
        
        // Determine available actions
        status.setCanStartService("ACCEPTED".equals(request.getAppliedServicePackageStatus()) && !request.isServiceStarted());
        status.setCanAssignResources(request.isServiceStarted() && !request.isAllServicesCompleted());
        status.setCanFinalizeCase(isCaseReadyForFinalization(helpRequestId) && !request.isCaseFinalized());
        status.setCanSubmitFinalAssessment(request.isCaseFinalized() && !request.isFinalAssessmentCompleted());
        status.setCanMarkCompleted(request.isFinalAssessmentCompleted() && request.getStatus() != RequestStatus.COMPLETED);
        
        // Generate alerts
        List<String> alerts = new ArrayList<>();
        List<String> pendingActions = new ArrayList<>();
        
        if (request.isServiceStarted() && !request.isResourcesAssigned()) {
            pendingActions.add("Assign resources to service items");
        }
        
        if (executions != null) {
            for (ServiceItemExecution execution : executions) {
                if (execution.getRescheduleCount() >= 3) {
                    alerts.add("Service '" + execution.getServiceItem() + "' has been rescheduled multiple times");
                }
                if ("NOT_DELIVERED".equals(execution.getOutcome())) {
                    pendingActions.add("Reschedule service: " + execution.getServiceItem());
                }
                if (execution.isAdjustmentRequired()) {
                    pendingActions.add("Create adjustment plan for: " + execution.getServiceItem());
                }
            }
        }
        
        status.setAlerts(alerts);
        status.setPendingActions(pendingActions);
        
        return status;
    }

    @Override
    public int recalculateProgress(String helpRequestId) {
        HelpRequest request = getHelpRequestOrThrow(helpRequestId);
        
        int progress = 0;
        
        if (request.isServiceStarted()) {
            progress = 10;
        }
        
        if (request.isResourcesAssigned()) {
            progress = 25;
        }
        
        // Add progress from completed services
        if (request.getAppliedPackageItemExecutions() != null) {
            for (ServiceItemExecution execution : request.getAppliedPackageItemExecutions()) {
                progress += execution.getProgressContribution() != null ? execution.getProgressContribution() : 0;
            }
        }
        
        // Cap at appropriate levels
        if (!request.isCaseFinalized()) {
            progress = Math.min(progress, 85);
        } else if (!request.isFinalAssessmentCompleted()) {
            progress = 90;
        } else {
            progress = 100;
        }
        
        request.setProgress(progress);
        request.setLastUpdated(LocalDateTime.now());
        helpRequestRepository.save(request);
        
        return progress;
    }

    // ==================== DASHBOARD DATA ====================

    @Override
    public ServiceExecutionDashboardDTO getDashboardData(String socialWorkerId) {
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        
        ServiceExecutionDashboardDTO dashboard = new ServiceExecutionDashboardDTO();
        dashboard.setSocialWorkerId(socialWorkerId);
        dashboard.setDate(today);
        
        // Get all active help requests for this SW
        List<HelpRequest> activeRequests = helpRequestRepository.findByAssignedWorkerId(socialWorkerId).stream()
            .filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS)
            .collect(Collectors.toList());
        
        dashboard.setActiveServicesCount(activeRequests.size());
        
        // Today's scheduled services
        List<ServiceExecutionDashboardDTO.ScheduledServiceDTO> todaySchedule = new ArrayList<>();
        List<ServiceExecutionDashboardDTO.PendingUpdateDTO> pendingUpdates = new ArrayList<>();
        List<ServiceExecutionDashboardDTO.OverdueServiceDTO> overdueServices = new ArrayList<>();
        List<ServiceExecutionDashboardDTO.RecentCompletionDTO> recentCompletions = new ArrayList<>();
        
        for (HelpRequest request : activeRequests) {
            if (request.getAppliedPackageItemExecutions() != null) {
                for (ServiceItemExecution execution : request.getAppliedPackageItemExecutions()) {
                    if (execution.getScheduledDate() != null) {
                        LocalDate scheduledDate = execution.getScheduledDate().toLocalDate();
                        
                        // Today's schedule
                        if (scheduledDate.equals(today) && !"COMPLETED".equals(execution.getStatus())) {
                            ServiceExecutionDashboardDTO.ScheduledServiceDTO scheduled = new ServiceExecutionDashboardDTO.ScheduledServiceDTO();
                            scheduled.setHelpRequestId(request.getId());
                            scheduled.setTrackingId(request.getTrackingId());
                            scheduled.setServiceItem(execution.getServiceItem());
                            scheduled.setResourceName(execution.getAssignedResource());
                            scheduled.setResourceOrganization(execution.getResourceOrganization());
                            scheduled.setScheduledTime(execution.getScheduledTime() != null ? execution.getScheduledTime().toString() : "TBD");
                            scheduled.setStatus(execution.getStatus());
                            todaySchedule.add(scheduled);
                        }
                        
                        // Pending updates (past scheduled time, no outcome)
                        if (execution.getScheduledDate().isBefore(now) && 
                            execution.getOutcome() == null &&
                            !"COMPLETED".equals(execution.getStatus())) {
                            
                            ServiceExecutionDashboardDTO.PendingUpdateDTO pending = new ServiceExecutionDashboardDTO.PendingUpdateDTO();
                            pending.setHelpRequestId(request.getId());
                            pending.setTrackingId(request.getTrackingId());
                            pending.setServiceItem(execution.getServiceItem());
                            pending.setScheduledDateTime(execution.getScheduledDate());
                            pending.setResourceName(execution.getAssignedResource());
                            pending.setHoursPastDue(ChronoUnit.HOURS.between(execution.getScheduledDate(), now));
                            pendingUpdates.add(pending);
                        }
                        
                        // Overdue (scheduled date is in the past, still not completed)
                        if (scheduledDate.isBefore(today) && 
                            !"COMPLETED".equals(execution.getStatus()) &&
                            !"PARTIALLY_COMPLETED".equals(execution.getStatus())) {
                            
                            ServiceExecutionDashboardDTO.OverdueServiceDTO overdue = new ServiceExecutionDashboardDTO.OverdueServiceDTO();
                            overdue.setHelpRequestId(request.getId());
                            overdue.setTrackingId(request.getTrackingId());
                            overdue.setServiceItem(execution.getServiceItem());
                            overdue.setOriginalDate(execution.getOriginalScheduledDate() != null ? 
                                execution.getOriginalScheduledDate().toLocalDate() : scheduledDate);
                            overdue.setDaysPastDue((int) ChronoUnit.DAYS.between(scheduledDate, today));
                            overdue.setRescheduleCount(execution.getRescheduleCount());
                            overdueServices.add(overdue);
                        }
                    }
                    
                    // Recent completions (last 7 days)
                    if (execution.getCompletedAt() != null && 
                        execution.getCompletedAt().isAfter(now.minusDays(7))) {
                        
                        ServiceExecutionDashboardDTO.RecentCompletionDTO completion = new ServiceExecutionDashboardDTO.RecentCompletionDTO();
                        completion.setHelpRequestId(request.getId());
                        completion.setTrackingId(request.getTrackingId());
                        completion.setServiceItem(execution.getServiceItem());
                        completion.setCompletedAt(execution.getCompletedAt());
                        completion.setOutcome(execution.getOutcome());
                        recentCompletions.add(completion);
                    }
                }
            }
        }
        
        dashboard.setTodaySchedule(todaySchedule);
        dashboard.setPendingUpdates(pendingUpdates);
        dashboard.setOverdueServices(overdueServices);
        dashboard.setRecentCompletions(recentCompletions);
        
        dashboard.setTodayFollowUpCount(todaySchedule.size());
        dashboard.setPendingUpdatesCount(pendingUpdates.size());
        dashboard.setOverdueServicesCount(overdueServices.size());
        
        // Get upcoming follow-ups
        List<FollowUp> followUps = followUpRepository.findBySocialWorkerId(socialWorkerId);
        List<ServiceExecutionDashboardDTO.UpcomingFollowUpDTO> upcomingFollowUps = followUps.stream()
            .filter(f -> f.getScheduledDate() != null && 
                        f.getScheduledDate().isAfter(now) &&
                        f.getScheduledDate().isBefore(now.plusDays(7)) &&
                        !"COMPLETED".equals(f.getStatus()))
            .map(f -> {
                ServiceExecutionDashboardDTO.UpcomingFollowUpDTO dto = new ServiceExecutionDashboardDTO.UpcomingFollowUpDTO();
                dto.setId(f.getId());
                dto.setHelpRequestId(f.getHelpRequestId());
                dto.setChildName(f.getChildName());
                dto.setType(f.getType());
                dto.setScheduledDate(f.getScheduledDate());
                dto.setPriority(f.getPriority());
                return dto;
            })
            .collect(Collectors.toList());
        dashboard.setUpcomingFollowUps(upcomingFollowUps);
        
        // Generate alerts
        List<String> alerts = new ArrayList<>();
        if (pendingUpdates.size() > 0) {
            alerts.add("You have " + pendingUpdates.size() + " service(s) awaiting outcome update");
        }
        if (overdueServices.size() > 0) {
            alerts.add("You have " + overdueServices.size() + " overdue service(s)");
        }
        dashboard.setMorningAlerts(alerts);
        
        List<String> actionRequired = new ArrayList<>();
        if (todaySchedule.size() > 0) {
            actionRequired.add("Today you have " + todaySchedule.size() + " service follow-up(s)");
        }
        dashboard.setActionRequired(actionRequired);
        
        return dashboard;
    }

    @Override
    public int getTodayFollowUpCount(String socialWorkerId) {
        LocalDate today = LocalDate.now();
        
        List<HelpRequest> requests = helpRequestRepository.findByAssignedWorkerId(socialWorkerId).stream()
            .filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS)
            .collect(Collectors.toList());
        
        int count = 0;
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

    @Override
    public List<ServiceItemExecutionDTO> getOverdueServices(String socialWorkerId) {
        LocalDate today = LocalDate.now();
        List<ServiceItemExecutionDTO> overdue = new ArrayList<>();
        
        List<HelpRequest> requests = helpRequestRepository.findByAssignedWorkerId(socialWorkerId).stream()
            .filter(r -> r.getStatus() == RequestStatus.IN_PROGRESS)
            .collect(Collectors.toList());
        
        for (HelpRequest request : requests) {
            if (request.getAppliedPackageItemExecutions() != null) {
                int index = 0;
                for (ServiceItemExecution execution : request.getAppliedPackageItemExecutions()) {
                    if (execution.getScheduledDate() != null &&
                        execution.getScheduledDate().toLocalDate().isBefore(today) &&
                        !"COMPLETED".equals(execution.getStatus()) &&
                        !"PARTIALLY_COMPLETED".equals(execution.getStatus())) {
                        
                        ServiceItemExecutionDTO dto = convertExecutionToDTO(execution, index);
                        dto.setHelpRequestId(request.getId());
                        dto.setTrackingId(request.getTrackingId());
                        overdue.add(dto);
                    }
                    index++;
                }
            }
        }
        
        return overdue;
    }

    // ==================== HELPER METHODS ====================

    private HelpRequest getHelpRequestOrThrow(String helpRequestId) {
        return helpRequestRepository.findById(helpRequestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Help request not found"));
    }

    private void createInitialFollowUp(HelpRequest request, String socialWorkerId) {
        FollowUp followUp = new FollowUp();
        followUp.setSocialWorkerId(socialWorkerId);
        followUp.setHelpRequestId(request.getId());
        followUp.setChildName(request.getRequesterName());
        followUp.setType("Initial Service Check");
        followUp.setStatus("SCHEDULED");
        followUp.setPriority("HIGH");
        followUp.setScheduledDate(LocalDateTime.now().plusDays(1));
        followUp.setNotes("Auto-generated initial follow-up after service start");
        followUpRepository.save(followUp);
    }

    private void createMonitoringChecklist(HelpRequest request, String socialWorkerId) {
        MonitoringChecklist checklist = new MonitoringChecklist();
        checklist.setHelpRequestId(request.getId());
        checklist.setSocialWorkerId(socialWorkerId);
        
        List<MonitoringChecklist.ChecklistItem> items = new ArrayList<>();
        
        // Standard checklist items
        items.add(new MonitoringChecklist.ChecklistItem("item1", "Initial contact with beneficiary confirmed", "WELFARE", 1));
        items.add(new MonitoringChecklist.ChecklistItem("item2", "Service needs assessment completed", "WELFARE", 2));
        items.add(new MonitoringChecklist.ChecklistItem("item3", "All resources identified and scheduled", "SERVICE", 3));
        items.add(new MonitoringChecklist.ChecklistItem("item4", "Beneficiary informed of service schedule", "COMMUNICATION", 4));
        items.add(new MonitoringChecklist.ChecklistItem("item5", "Safety concerns addressed (if any)", "SAFETY", 5));
        items.add(new MonitoringChecklist.ChecklistItem("item6", "Documentation collected", "DOCUMENTATION", 6));
        items.add(new MonitoringChecklist.ChecklistItem("item7", "Mid-service progress check completed", "MONITORING", 7));
        items.add(new MonitoringChecklist.ChecklistItem("item8", "All services delivered", "SERVICE", 8));
        items.add(new MonitoringChecklist.ChecklistItem("item9", "Beneficiary satisfaction assessed", "FEEDBACK", 9));
        items.add(new MonitoringChecklist.ChecklistItem("item10", "Final documentation complete", "DOCUMENTATION", 10));
        
        checklist.setItems(items);
        monitoringChecklistRepository.save(checklist);
    }

    private void createOrUpdateDailyTracker(HelpRequest request, String socialWorkerId, LocalDate date) {
        Optional<DailyActivityTracker> existing = dailyActivityTrackerRepository
            .findByHelpRequestIdAndTrackingDate(request.getId(), date);
        
        DailyActivityTracker tracker = existing.orElse(new DailyActivityTracker());
        tracker.setHelpRequestId(request.getId());
        tracker.setSocialWorkerId(socialWorkerId);
        tracker.setTrackingDate(date);
        
        dailyActivityTrackerRepository.save(tracker);
    }

    private FollowUp createServiceFollowUp(HelpRequest request, ServiceItemExecution execution, 
                                           LocalDate scheduledDate, String socialWorkerId) {
        if (scheduledDate == null) {
            return null;
        }
        
        FollowUp followUp = new FollowUp();
        followUp.setSocialWorkerId(socialWorkerId);
        followUp.setHelpRequestId(request.getId());
        followUp.setChildName(request.getRequesterName());
        followUp.setType("Service Delivery: " + execution.getServiceItem());
        followUp.setStatus("SCHEDULED");
        followUp.setPriority("MEDIUM");
        followUp.setScheduledDate(scheduledDate.atStartOfDay());
        followUp.setNotes("Service: " + execution.getServiceItem() + 
                         "\nResource: " + execution.getAssignedResource() + 
                         "\nOrganization: " + execution.getResourceOrganization());
        
        return followUpRepository.save(followUp);
    }

    private void createNextFollowUp(HelpRequest request, ServiceItemExecution execution, 
                                    int daysLater, String socialWorkerId) {
        LocalDateTime nextDate = LocalDateTime.now().plusDays(daysLater);
        
        FollowUp followUp = new FollowUp();
        followUp.setSocialWorkerId(socialWorkerId);
        followUp.setHelpRequestId(request.getId());
        followUp.setChildName(request.getRequesterName());
        followUp.setType("Follow-up: " + execution.getServiceItem());
        followUp.setStatus("SCHEDULED");
        followUp.setPriority("MEDIUM");
        followUp.setScheduledDate(nextDate);
        followUp.setNotes("Auto-scheduled follow-up for service: " + execution.getServiceItem());
        
        FollowUp saved = followUpRepository.save(followUp);
        execution.setNextFollowUpDate(nextDate);
        execution.setFollowUpId(saved.getId());
    }

    private void checkAllServicesCompleted(HelpRequest request) {
        if (request.getAppliedPackageItemExecutions() == null) {
            return;
        }
        
        boolean allDone = request.getAppliedPackageItemExecutions().stream()
            .allMatch(e -> "COMPLETED".equals(e.getStatus()) || "PARTIALLY_COMPLETED".equals(e.getStatus()));
        
        if (allDone) {
            request.setAllServicesCompleted(true);
            
            // Timeline event
            if (timelineService != null) {
                CaseTimelineDTO timeline = new CaseTimelineDTO();
                timeline.setHelpRequestId(request.getId());
                timeline.setEventType(CaseTimelineEvent.EventType.SERVICE_EXECUTION_ALL_COMPLETED);
                timeline.setTitle("All Services Completed");
                timeline.setDescription("All service items have been completed. Case ready for finalization.");
                timelineService.createTimelineEvent(timeline);
            }
        }
    }

    private HelpRequestDTO convertToDTO(HelpRequest request) {
        HelpRequestDTO dto = new HelpRequestDTO();
        dto.setId(request.getId());
        dto.setTrackingId(request.getTrackingId());
        dto.setRequesterUserId(request.getRequesterUserId());
        dto.setAnonymous(request.isAnonymous());
        dto.setRequesterName(request.getRequesterName());
        dto.setApproximateAge(request.getApproximateAge());
        dto.setGender(request.getGender());
        dto.setIdentificationMarks(request.getIdentificationMarks());
        dto.setHelpType(request.getHelpType());
        dto.setDescription(request.getDescription());
        dto.setLocation(request.getLocation());
        dto.setDocumentUrls(request.getDocumentUrls());
        dto.setStatus(request.getStatus());
        dto.setAssignedWorkerId(request.getAssignedWorkerId());
        dto.setPriority(request.getPriority());
        dto.setRequestDate(request.getRequestDate());
        dto.setLastUpdated(request.getLastUpdated());
        dto.setCompletionDate(request.getCompletionDate());
        dto.setRequestNotes(request.getRequestNotes());
        dto.setAppliedServicePackageId(request.getAppliedServicePackageId());
        dto.setAppliedServicePackageAppliedAt(request.getAppliedServicePackageAppliedAt());
        dto.setAppliedServicePackageStatus(request.getAppliedServicePackageStatus());
        dto.setProgress(request.getProgress());
        dto.setServiceStarted(request.isServiceStarted());
        dto.setResourcesAssigned(request.isResourcesAssigned());
        dto.setAllServicesCompleted(request.isAllServicesCompleted());
        dto.setFinalAssessmentCompleted(request.isFinalAssessmentCompleted());
        dto.setCaseFinalized(request.isCaseFinalized());
        
        return dto;
    }

    private ServiceItemExecutionDTO convertExecutionToDTO(ServiceItemExecution execution, int index) {
        ServiceItemExecutionDTO dto = new ServiceItemExecutionDTO();
        dto.setServiceItem(execution.getServiceItem());
        dto.setIndex(index);
        dto.setStatus(execution.getStatus());
        dto.setAssignedResource(execution.getAssignedResource());
        dto.setResourceOrganization(execution.getResourceOrganization());
        dto.setScheduledDate(execution.getScheduledDate());
        dto.setScheduledTime(execution.getScheduledTime());
        dto.setNotes(execution.getNotes());
        dto.setOutcome(execution.getOutcome());
        dto.setOutcomeReason(execution.getOutcomeReason());
        dto.setOutcomeNotes(execution.getOutcomeNotes());
        dto.setOutcomeRecordedAt(execution.getOutcomeRecordedAt());
        dto.setProgressContribution(execution.getProgressContribution());
        dto.setProofUrls(execution.getProofUrls());
        dto.setProofDescription(execution.getProofDescription());
        dto.setOriginalScheduledDate(execution.getOriginalScheduledDate());
        dto.setRescheduleCount(execution.getRescheduleCount());
        dto.setLastRescheduleReason(execution.getLastRescheduleReason());
        dto.setNextFollowUpDate(execution.getNextFollowUpDate());
        dto.setFollowUpId(execution.getFollowUpId());
        dto.setAdjustmentPlan(execution.getAdjustmentPlan());
        dto.setAdjustmentRequired(execution.isAdjustmentRequired());
        dto.setCreatedAt(execution.getCreatedAt());
        dto.setUpdatedAt(execution.getUpdatedAt());
        dto.setCompletedAt(execution.getCompletedAt());
        return dto;
    }
}
