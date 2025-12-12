package com.example.childPortal.service.impl;

import com.example.childPortal.dto.CaseTimelineDTO;
import com.example.childPortal.dto.TimelineFilterDTO;
import com.example.childPortal.model.*;
import com.example.childPortal.model.CaseTimelineEvent.EventType;
import com.example.childPortal.repository.*;
import com.example.childPortal.service.CaseTimelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CaseTimelineServiceImpl implements CaseTimelineService {
    
    @Autowired
    private CaseTimelineRepository caseTimelineRepository;
    
    @Autowired
    private CaseRepository caseRepository;
    
    @Autowired
    private HelpRequestRepository helpRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void createTimelineEvent(CaseTimelineDTO timelineDTO) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setCaseId(timelineDTO.getCaseId()); 
        event.setHelpRequestId(timelineDTO.getHelpRequestId()); 
        event.setEventType(timelineDTO.getEventType()); 
        event.setTitle(timelineDTO.getTitle()); 
        event.setDescription(timelineDTO.getDescription()); 
        event.setDetails(timelineDTO.getDetails()); 
        event.setPerformedByUserId(timelineDTO.getPerformedByUserId()); 
        event.setPerformedByRole(timelineDTO.getPerformedByRole()); 
        event.setPerformedByName(timelineDTO.getPerformedByName()); 
        event.setTargetUserId(timelineDTO.getTargetUserId()); 
        event.setTargetRole(timelineDTO.getTargetRole()); 
        event.setTargetName(timelineDTO.getTargetName()); 
        event.setPreviousStatus(timelineDTO.getPreviousStatus()); 
        event.setNewStatus(timelineDTO.getNewStatus()); 
        event.setStatusChangeReason(timelineDTO.getStatusChangeReason());
        event.setPreviousPriority(timelineDTO.getPreviousPriority());
        event.setNewPriority(timelineDTO.getNewPriority());
        event.setAssignedToUserId(timelineDTO.getAssignedToUserId());
        event.setAssignedFromUserId(timelineDTO.getAssignedFromUserId());
        event.setEvidenceUrl(timelineDTO.getEvidenceUrl());
        event.setDocumentUrl(timelineDTO.getDocumentUrl());
        event.setEventTime(timelineDTO.getEventTime() != null ? timelineDTO.getEventTime() : LocalDateTime.now());
        caseTimelineRepository.save(event); 
    }
    
    @Override
    public List<CaseTimelineDTO> getTimelineForCase(String caseId) {
        List<CaseTimelineEvent> events = caseTimelineRepository.findByCaseIdOrderByEventTimeDesc(caseId);
        return events.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<CaseTimelineDTO> getTimelineForHelpRequest(String helpRequestId) {
        List<CaseTimelineEvent> events = caseTimelineRepository.findByHelpRequestIdOrderByEventTimeDesc(helpRequestId);
        return events.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList()); 
    }
    
    @Override
    public List<CaseTimelineDTO> getFilteredTimeline(TimelineFilterDTO filter) {
        List<CaseTimelineEvent> events;
        
        if (filter.getCaseId() != null) {
            events = caseTimelineRepository.findByCaseIdOrderByEventTimeDesc(filter.getCaseId());
        } else if (filter.getHelpRequestId() != null) {
            events = caseTimelineRepository.findByHelpRequestIdOrderByEventTimeDesc(filter.getHelpRequestId());
        } else {
            Pageable pageable = PageRequest.of(filter.getPage(), filter.getPageSize(), Sort.by("eventTime").descending());
            events = caseTimelineRepository.findAll(pageable).getContent();
        }
        
        List<CaseTimelineEvent> filteredEvents = events.stream()
            .filter(event -> {
                if (filter.getEventTypes() != null && !filter.getEventTypes().isEmpty()) {
                    return filter.getEventTypes().contains(event.getEventType());
                }
                return true;
            })
            .filter(event -> {
                if (filter.getPerformedByRoles() != null && !filter.getPerformedByRoles().isEmpty()) {
                    String eventRole = event.getPerformedByRole();
                    return filter.getPerformedByRoles().stream()
                        .anyMatch(role -> role.name().equals(eventRole));
                }
                return true;
            })
            .filter(event -> {
                if (filter.getPerformedByUserId() != null && !filter.getPerformedByUserId().isEmpty()) {
                    return filter.getPerformedByUserId().equals(event.getPerformedByUserId());
                }
                return true;
            })
            .filter(event -> {
                if (filter.getStartDate() != null && event.getEventTime().isBefore(filter.getStartDate())) {
                    return false;
                }
                if (filter.getEndDate() != null && event.getEventTime().isAfter(filter.getEndDate())) {
                    return false;
                }
                return true;
            })
            .filter(event -> {
                if (!filter.isShowSystemEvents() && event.getEventType() == EventType.SYSTEM_AUTO_ACTION) {
                    return false;
                }
                return true;
            })
            .filter(event -> {
                if (filter.getSearchText() != null && !filter.getSearchText().isEmpty()) {
                    String searchLower = filter.getSearchText().toLowerCase();
                    return event.getTitle().toLowerCase().contains(searchLower) ||
                        event.getDescription().toLowerCase().contains(searchLower) ||
                        (event.getPerformedByName() != null && event.getPerformedByName().toLowerCase().contains(searchLower));
                }
                return true;
            })
            .collect(Collectors.toList());
        
        if (filter.isShowMajorEventsOnly()) {
            filteredEvents = filteredEvents.stream()
                .filter(this::isMajorEvent)
                .collect(Collectors.toList());
        }
        
        return filteredEvents.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public CaseTimelineDTO getTimelineEvent(String eventId) {
        Optional<CaseTimelineEvent> eventOpt = caseTimelineRepository.findById(eventId);
        return eventOpt.map(this::convertToDTO).orElse(null); 
    }
    
    @Override
    public void createCaseCreatedEvent(String caseId, String reporterUserId, String reporterName) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isPresent()) {
            Case caseEntity = caseOpt.get();
            CaseTimelineDTO timelineDTO = new CaseTimelineDTO();
            timelineDTO.setCaseId(caseId);
            timelineDTO.setEventType(EventType.CASE_CREATED);
            timelineDTO.setTitle("Case Created");
            timelineDTO.setDescription("New case reported: " + caseEntity.getCaseType());
            timelineDTO.setPerformedByUserId(reporterUserId);
            timelineDTO.setPerformedByName(reporterName);
            timelineDTO.setPerformedByRole(reporterUserId != null ? "PU" : "ANONYMOUS");
            timelineDTO.setNewStatus(caseEntity.getStatus());
            timelineDTO.setNewPriority(caseEntity.getPriority());
            createTimelineEvent(timelineDTO);
        }
    }
    
    @Override
    public void createStatusChangeEvent(String caseId, String changedByUserId, String changedByName,
                                       String previousStatus, String newStatus, String reason) { 
        CaseTimelineDTO timelineDTO = new CaseTimelineDTO();
        timelineDTO.setCaseId(caseId); 
        timelineDTO.setEventType(EventType.STATUS_CHANGED); 
        timelineDTO.setTitle("Status Updated");
        timelineDTO.setDescription("Case status changed from " + previousStatus + " to " + newStatus);
        timelineDTO.setDetails(reason);
        timelineDTO.setPerformedByUserId(changedByUserId);
        timelineDTO.setPerformedByName(changedByName); 
        timelineDTO.setPerformedByRole(getRoleForUser(changedByUserId)); 
        
        try {
            timelineDTO.setPreviousStatus(Case.CaseStatus.valueOf(previousStatus));
            timelineDTO.setNewStatus(Case.CaseStatus.valueOf(newStatus));
        } catch (IllegalArgumentException e) {
            // Handle invalid status values
            timelineDTO.setPreviousStatus(null);
            timelineDTO.setNewStatus(null);
        }
        
        timelineDTO.setStatusChangeReason(reason);
        timelineDTO.setIcon("fa-exchange-alt"); 
        timelineDTO.setColor("#007bff"); 
        timelineDTO.setMajorEvent(true); 
        timelineDTO.setUserAction(true);
        createTimelineEvent(timelineDTO); 
    }
    
    @Override
    public void createAssignmentEvent(String caseId, String assignedByUserId, String assignedByName,
                                     String assignedToUserId, String assignedToName, String role) { 
        CaseTimelineDTO timelineDTO = new CaseTimelineDTO(); 
        timelineDTO.setCaseId(caseId); 
        timelineDTO.setEventType(EventType.CASE_ASSIGNED); 
        timelineDTO.setTitle("Case Assigned");
        timelineDTO.setDescription("Case assigned to " + assignedToName + " (" + role + ")"); 
        timelineDTO.setPerformedByUserId(assignedByUserId); 
        timelineDTO.setPerformedByName(assignedByName); 
        timelineDTO.setPerformedByRole(getRoleForUser(assignedByUserId)); 
        timelineDTO.setTargetUserId(assignedToUserId); 
        timelineDTO.setTargetName(assignedToName);
        timelineDTO.setTargetRole(role); 
        timelineDTO.setAssignedToUserId(assignedToUserId); 
        timelineDTO.setAssignedToName(assignedToName);
        timelineDTO.setIcon("fa-user-check"); 
        timelineDTO.setColor("#17a2b8"); 
        timelineDTO.setMajorEvent(true); 
        timelineDTO.setUserAction(true);
        createTimelineEvent(timelineDTO); 
    }
    
    @Override
    public void createPriorityChangeEvent(String caseId, String changedByUserId, String changedByName,
                                         String previousPriority, String newPriority, String reason) { 
        CaseTimelineDTO timelineDTO = new CaseTimelineDTO();
        timelineDTO.setCaseId(caseId);
        timelineDTO.setEventType(EventType.PRIORITY_CHANGED);
        timelineDTO.setTitle("Priority Updated");
        timelineDTO.setDescription("Priority changed from " + previousPriority + " to " + newPriority);
        timelineDTO.setDetails(reason); 
        timelineDTO.setPerformedByUserId(changedByUserId); 
        timelineDTO.setPerformedByName(changedByName); 
        timelineDTO.setPerformedByRole(getRoleForUser(changedByUserId)); 
        
        try {
            timelineDTO.setPreviousPriority(Priority.valueOf(previousPriority));
            timelineDTO.setNewPriority(Priority.valueOf(newPriority));
        } catch (IllegalArgumentException e) {
            // Handle invalid priority values
            timelineDTO.setPreviousPriority(null);
            timelineDTO.setNewPriority(null);
        }
        
        timelineDTO.setIcon("fa-exclamation-circle"); 
        timelineDTO.setColor("#ffc107"); 
        timelineDTO.setMajorEvent(true); 
        timelineDTO.setUserAction(true);
        createTimelineEvent(timelineDTO); 
    }
    
    @Override
    public void createInformationRequestEvent(String caseId, String requestedByUserId, String requestedByName,
                                            String requestedFromUserId, String requestedFromName) { 
        CaseTimelineDTO timelineDTO = new CaseTimelineDTO();
        timelineDTO.setCaseId(caseId); 
        timelineDTO.setEventType(EventType.INFORMATION_REQUESTED); 
        timelineDTO.setTitle("Information Requested");
        timelineDTO.setDescription(requestedByName + " requested additional information from " + requestedFromName);
        timelineDTO.setPerformedByUserId(requestedByUserId);
        timelineDTO.setPerformedByName(requestedByName);
        timelineDTO.setPerformedByRole(getRoleForUser(requestedByUserId));
        timelineDTO.setTargetUserId(requestedFromUserId);
        timelineDTO.setTargetName(requestedFromName);
        timelineDTO.setTargetRole("PU");
        timelineDTO.setIcon("fa-question-circle"); 
        timelineDTO.setColor("#6f42c1"); 
        timelineDTO.setMajorEvent(false); 
        timelineDTO.setUserAction(true);
        createTimelineEvent(timelineDTO); 
    }
    
    @Override
    public void createEvidenceAddedEvent(String caseId, String addedByUserId, String addedByName,
                                        String evidenceUrl, String description) { 
        CaseTimelineDTO timelineDTO = new CaseTimelineDTO();
        timelineDTO.setCaseId(caseId); 
        timelineDTO.setEventType(EventType.EVIDENCE_ADDED); 
        timelineDTO.setTitle("Evidence Added"); 
        timelineDTO.setDescription("New evidence uploaded: " + description);
        timelineDTO.setPerformedByUserId(addedByUserId); 
        timelineDTO.setPerformedByName(addedByName); 
        timelineDTO.setPerformedByRole(getRoleForUser(addedByUserId)); 
        timelineDTO.setEvidenceUrl(evidenceUrl);
        timelineDTO.setIcon("fa-file-upload");
        timelineDTO.setColor("#20c997");
        timelineDTO.setMajorEvent(false);
        timelineDTO.setUserAction(true);
        createTimelineEvent(timelineDTO); 
    }
    
    @Override
    public void createCaseResolvedEvent(String caseId, String resolvedByUserId, String resolvedByName,
                                       String resolutionDetails) { 
        CaseTimelineDTO timelineDTO = new CaseTimelineDTO();
        timelineDTO.setCaseId(caseId); 
        timelineDTO.setEventType(EventType.CASE_RESOLVED); 
        timelineDTO.setTitle("Case Resolved"); 
        timelineDTO.setDescription("Case marked as resolved"); 
        timelineDTO.setDetails(resolutionDetails); 
        timelineDTO.setPerformedByUserId(resolvedByUserId); 
        timelineDTO.setPerformedByName(resolvedByName);
        timelineDTO.setPerformedByRole(getRoleForUser(resolvedByUserId)); 
        timelineDTO.setNewStatus(Case.CaseStatus.RESOLVED);
        timelineDTO.setIcon("fa-check-circle"); 
        timelineDTO.setColor("#28a745"); 
        timelineDTO.setMajorEvent(true); 
        timelineDTO.setUserAction(true);
        createTimelineEvent(timelineDTO); 
    }
    
    @Override
    public List<CaseTimelineDTO> getRecentActivity(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("eventTime").descending());
        List<CaseTimelineEvent> events = caseTimelineRepository.findAll(pageable).getContent();
        return events.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public long getEventCountForCase(String caseId) {
        return caseTimelineRepository.countByCaseId(caseId);
    }
    
    @Override
    public void deleteTimelineEvent(String eventId) {
        caseTimelineRepository.deleteById(eventId); 
    }
    
    private CaseTimelineDTO convertToDTO(CaseTimelineEvent event) { 
        CaseTimelineDTO dto = new CaseTimelineDTO(); 
        dto.setId(event.getId());
        dto.setCaseId(event.getCaseId()); 
        dto.setHelpRequestId(event.getHelpRequestId()); 
        dto.setEventType(event.getEventType()); 
        dto.setTitle(event.getTitle()); 
        dto.setDescription(event.getDescription()); 
        dto.setDetails(event.getDetails()); 
        dto.setPerformedByUserId(event.getPerformedByUserId()); 
        dto.setPerformedByRole(event.getPerformedByRole()); 
        dto.setPerformedByName(event.getPerformedByName()); 
        dto.setTargetUserId(event.getTargetUserId()); 
        dto.setTargetRole(event.getTargetRole()); 
        dto.setTargetName(event.getTargetName()); 
        dto.setPreviousStatus(event.getPreviousStatus()); 
        dto.setNewStatus(event.getNewStatus()); 
        dto.setStatusChangeReason(event.getStatusChangeReason()); 
        dto.setPreviousPriority(event.getPreviousPriority());
        dto.setNewPriority(event.getNewPriority()); 
        dto.setAssignedToUserId(event.getAssignedToUserId()); 
        dto.setAssignedFromUserId(event.getAssignedFromUserId()); 
        dto.setEvidenceUrl(event.getEvidenceUrl()); 
        dto.setDocumentUrl(event.getDocumentUrl()); 
        dto.setEventTime(event.getEventTime()); 
        dto.setMetadata(event.getMetadata());
        
        if (event.getCaseId() != null) {
            Optional<Case> caseOpt = caseRepository.findById(event.getCaseId());
            caseOpt.ifPresent(caseEntity -> dto.setTrackingId(caseEntity.getTrackingId())); 
        }
        if (event.getAssignedToUserId() != null) {
            Optional<User> user = userRepository.findById(event.getAssignedToUserId());
            user.ifPresent(u -> dto.setAssignedToName(u.getFullName())); 
        }
        if (event.getAssignedFromUserId() != null) {
            Optional<User> user = userRepository.findById(event.getAssignedFromUserId());
            user.ifPresent(u -> dto.setAssignedFromName(u.getFullName()));
        }
        dto.setTimeAgo(calculateTimeAgo(event.getEventTime()));
        setUIProperties(dto, event);
        return dto; 
    }
    
    private void setUIProperties(CaseTimelineDTO dto, CaseTimelineEvent event) { 
        switch (event.getEventType()) {
            case CASE_CREATED:
                dto.setIcon("fa-plus-circle");
                dto.setColor("#28a745");
                dto.setMajorEvent(true);
                break;
            case CASE_APPROVED:
                dto.setIcon("fa-check-circle");
                dto.setColor("#28a745");
                dto.setMajorEvent(true);
                break;
            case CASE_REJECTED:
                dto.setIcon("fa-times-circle");
                dto.setColor("#dc3545");
                dto.setMajorEvent(true);
                break;
            case CASE_ASSIGNED:
                dto.setIcon("fa-user-check");
                dto.setColor("#17a2b8");
                dto.setMajorEvent(true); 
                break;
            case STATUS_CHANGED:
                dto.setIcon("fa-exchange-alt");
                dto.setColor("#007bff");
                dto.setMajorEvent(true);
                break;
            case PRIORITY_CHANGED:
                dto.setIcon("fa-exclamation-circle");
                dto.setColor("#ffc107");
                dto.setMajorEvent(true);
                break;
            case INFORMATION_REQUESTED:
                dto.setIcon("fa-question-circle"); 
                dto.setColor("#6f42c1"); 
                dto.setMajorEvent(false);
                break;
            case EVIDENCE_ADDED:
                dto.setIcon("fa-file-upload");
                dto.setColor("#20c997");
                dto.setMajorEvent(false);
                break;
            case CASE_RESOLVED:
                dto.setIcon("fa-check-circle");
                dto.setColor("#28a745");
                dto.setMajorEvent(true);
                break;
            case CASE_CLOSED:
                dto.setIcon("fa-archive");
                dto.setColor("#6c757d");
                dto.setMajorEvent(true);
                break;
            case FEEDBACK_SUBMITTED:
                dto.setIcon("fa-comment");
                dto.setColor("#6f42c1");
                dto.setMajorEvent(false);
                break;
            case SYSTEM_AUTO_ACTION:
                dto.setIcon("fa-robot");
                dto.setColor("#6c757d");
                dto.setSystemEvent(true);
                dto.setMajorEvent(false);
                break;
            default: 
                dto.setIcon("fa-circle"); 
                dto.setColor("#6c757d");
                dto.setMajorEvent(false);
        }
        dto.setUserAction(event.getPerformedByUserId() != null && event.getEventType() != EventType.SYSTEM_AUTO_ACTION);
    }
    
    private String calculateTimeAgo(LocalDateTime eventTime) { 
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(eventTime, now);
        
        if (duration.toMinutes() < 1) { 
            return "Just now";
        } else if (duration.toMinutes() < 60) {
            long minutes = duration.toMinutes();
            return minutes + (minutes == 1 ? " minute ago" : " minutes ago");
        } else if (duration.toHours() < 24) {
            long hours = duration.toHours();
            return hours + (hours == 1 ? " hour ago" : " hours ago");
        } else if (duration.toDays() < 7) {
            long days = duration.toDays();
            return days + (days == 1 ? " day ago" : " days ago");
        } else if (duration.toDays() < 30) {
            long weeks = duration.toDays() / 7;
            return weeks + (weeks == 1 ? " week ago" : " weeks ago");
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy"); 
            return eventTime.format(formatter);
        } 
    }
    
    private String getRoleForUser(String userId) {
        if (userId == null) {
            return "SYSTEM"; 
        }
        Optional<User> userOpt = userRepository.findById(userId); 
        if (userOpt.isPresent()) {
            return userOpt.get().getRole().name(); 
        }
        return "UNKNOWN"; 
    }
    
    private boolean isMajorEvent(CaseTimelineEvent event) {
        return switch (event.getEventType()) {
            case CASE_CREATED, CASE_APPROVED, CASE_REJECTED, CASE_ASSIGNED,
                 STATUS_CHANGED, PRIORITY_CHANGED, CASE_RESOLVED, CASE_CLOSED -> true;
            default -> false; 
        };
    }
}