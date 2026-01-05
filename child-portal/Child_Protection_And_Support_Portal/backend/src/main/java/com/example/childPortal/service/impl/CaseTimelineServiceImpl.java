package com.example.childPortal.service.impl;

import com.example.childPortal.dto.CaseTimelineDTO;
import com.example.childPortal.dto.TimelineFilterDTO;
import com.example.childPortal.model.CaseTimelineEvent;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.repository.CaseTimelineEventRepository;
import com.example.childPortal.service.CaseTimelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CaseTimelineServiceImpl implements CaseTimelineService {

    @Autowired
    private CaseTimelineEventRepository timelineEventRepository;

    @Override
    public void createTimelineEvent(CaseTimelineDTO timelineDTO) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setCaseId(timelineDTO.getCaseId());
        event.setHelpRequestId(timelineDTO.getHelpRequestId());
        event.setEventType(timelineDTO.getEventType());
        event.setDescription(timelineDTO.getDescription());
        event.setPerformedByUserId(timelineDTO.getPerformedByUserId());
        event.setPerformedByName(timelineDTO.getPerformedByName());
        event.setEventTime(timelineDTO.getEventTime() != null ? timelineDTO.getEventTime() : LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    @Override
    public List<CaseTimelineDTO> getTimelineForCase(String caseId) {
        List<CaseTimelineEvent> events = timelineEventRepository.findByCaseIdOrderByEventTimeDesc(caseId);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CaseTimelineDTO> getTimelineForHelpRequest(String helpRequestId) {
        List<CaseTimelineEvent> events = timelineEventRepository.findByHelpRequestIdOrderByEventTimeDesc(helpRequestId);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CaseTimelineDTO> getFilteredTimeline(TimelineFilterDTO filter) {
        List<CaseTimelineEvent> events = new ArrayList<>();
        
        if (filter.getCaseId() != null) {
            events = timelineEventRepository.findByCaseIdOrderByEventTimeDesc(filter.getCaseId());
        } else if (filter.getHelpRequestId() != null) {
            events = timelineEventRepository.findByHelpRequestIdOrderByEventTimeDesc(filter.getHelpRequestId());
        }

        if (filter.getEventTypes() != null && !filter.getEventTypes().isEmpty()) {
            events = events.stream()
                .filter(e -> filter.getEventTypes().contains(e.getEventType()))
                .collect(Collectors.toList());
        }
        
        if (filter.getPerformedByUserId() != null) {
            events = events.stream()
                .filter(e -> filter.getPerformedByUserId().equals(e.getPerformedByUserId()))
                .collect(Collectors.toList());
        }
        
        if (filter.getStartDate() != null || filter.getEndDate() != null) {
            LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : LocalDateTime.MIN;
            LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : LocalDateTime.MAX;
            events = events.stream()
                .filter(e -> !e.getEventTime().isBefore(start) && !e.getEventTime().isAfter(end))
                .collect(Collectors.toList());
        }
        
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public CaseTimelineDTO getTimelineEvent(String eventId) {
        return timelineEventRepository.findById(eventId)
            .map(this::convertToDTO)
            .orElse(null);
    }

    @Override
    public List<CaseTimelineDTO> getRecentActivity(int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        Pageable pageable = PageRequest.of(0, limit);
        List<CaseTimelineEvent> events = timelineEventRepository.findRecentEvents(since, pageable);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public long getEventCountForCase(String caseId) {
        return timelineEventRepository.countByCaseId(caseId);
    }

    @Override
    public void deleteTimelineEvent(String eventId) {
        timelineEventRepository.deleteById(eventId);
    }

    private CaseTimelineDTO convertToDTO(CaseTimelineEvent event) {
        CaseTimelineDTO dto = new CaseTimelineDTO();
        dto.setId(event.getId());
        dto.setCaseId(event.getCaseId());
        dto.setHelpRequestId(event.getHelpRequestId());
        dto.setEventType(event.getEventType());
        dto.setDescription(event.getDescription());
        dto.setPerformedByUserId(event.getPerformedByUserId());
        dto.setPerformedByName(event.getPerformedByName());
        dto.setEventTime(event.getEventTime());
        return dto;
    }

    public void createHelpRequestCreatedEvent(String helpRequestId, String requesterUserId, String requesterName) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setHelpRequestId(helpRequestId);
        event.setEventType(CaseTimelineEvent.EventType.HELP_REQUEST_CREATED);
        event.setTitle("Help Request Created");
        event.setDescription("Help request created by " + requesterName);
        event.setPerformedByUserId(requesterUserId);
        event.setPerformedByName(requesterName);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    public void createHelpRequestStatusChangeEvent(String helpRequestId, String changedByUserId, 
                                                   String changedByName, RequestStatus previousStatus, 
                                                   RequestStatus newStatus, String reason) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setHelpRequestId(helpRequestId);
        event.setEventType(CaseTimelineEvent.EventType.HELP_REQUEST_STATUS_CHANGED);
        event.setTitle("Status Changed");
        event.setDescription("Status changed from " + previousStatus + " to " + newStatus + 
                           (reason != null ? " (Reason: " + reason + ")" : ""));
        event.setPreviousHelpRequestStatus(previousStatus);
        event.setNewHelpRequestStatus(newStatus);
        event.setStatusChangeReason(reason);
        event.setPerformedByUserId(changedByUserId);
        event.setPerformedByName(changedByName);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    public void createHelpRequestAssignedEvent(String helpRequestId, String assignedToUserId, 
                                               String assignedToName, String assignedByUserId, 
                                               String assignedByName) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setHelpRequestId(helpRequestId);
        event.setEventType(CaseTimelineEvent.EventType.HELP_REQUEST_ASSIGNED);
        event.setTitle("Help Request Assigned");
        event.setDescription("Help request assigned to " + assignedToName);
        event.setPerformedByUserId(assignedByUserId);
        event.setPerformedByName(assignedByName);
        event.setAssignedToUserId(assignedToUserId);
        event.setTargetName(assignedToName);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    public void createServiceOfferCreatedEvent(String helpRequestId, String serviceOfferId, 
                                               String workerId, String workerName) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setHelpRequestId(helpRequestId);
        event.setEventType(CaseTimelineEvent.EventType.SERVICE_OFFER_CREATED);
        event.setTitle("Service Offer Created");
        event.setDescription("Service offer created by " + workerName);
        event.setPerformedByUserId(workerId);
        event.setPerformedByName(workerName);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    public void createServiceOfferAcceptedEvent(String helpRequestId, String serviceOfferId, 
                                                String acceptedByUserId, String acceptedByName) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setHelpRequestId(helpRequestId);
        event.setEventType(CaseTimelineEvent.EventType.SERVICE_OFFER_ACCEPTED);
        event.setTitle("Service Offer Accepted");
        event.setDescription("Service offer accepted by " + acceptedByName);
        event.setPerformedByUserId(acceptedByUserId);
        event.setPerformedByName(acceptedByName);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    public void createServiceCompletedEvent(String helpRequestId, String serviceOfferId, 
                                           String completedByUserId, String completedByName) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setHelpRequestId(helpRequestId);
        event.setEventType(CaseTimelineEvent.EventType.SERVICE_COMPLETED);
        event.setTitle("Service Completed");
        event.setDescription("Service completed by " + completedByName);
        event.setPerformedByUserId(completedByUserId);
        event.setPerformedByName(completedByName);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    public void createHelpRequestTransferEvent(String helpRequestId, String transferRequestId, 
                                               String fromUserId, String toUserId, 
                                               String requestedByUserId, String requestedByName) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setHelpRequestId(helpRequestId);
        event.setEventType(CaseTimelineEvent.EventType.HELP_REQUEST_TRANSFER_REQUESTED);
        event.setTitle("Transfer Requested");
        event.setDescription("Transfer requested by " + requestedByName);
        event.setPerformedByUserId(requestedByUserId);
        event.setPerformedByName(requestedByName);
        event.setAssignedFromUserId(fromUserId);
        event.setAssignedToUserId(toUserId);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    public void createHelpRequestNoteAddedEvent(String helpRequestId, String addedByUserId, 
                                               String addedByName, String note) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setHelpRequestId(helpRequestId);
        event.setEventType(CaseTimelineEvent.EventType.HELP_REQUEST_NOTE_ADDED);
        event.setTitle("Note Added");
        event.setDescription("Note added by " + addedByName);
        event.setDetails(note);
        event.setPerformedByUserId(addedByUserId);
        event.setPerformedByName(addedByName);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    public long getEventCountForHelpRequest(String helpRequestId) {
        return timelineEventRepository.countByHelpRequestId(helpRequestId);
    }

    public void createCaseCreatedEvent(String caseId, String reporterUserId, String reporterName) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setCaseId(caseId);
        event.setEventType(CaseTimelineEvent.EventType.CASE_CREATED);
        event.setTitle("Case Created");
        event.setDescription("Case created by " + reporterName);
        event.setPerformedByUserId(reporterUserId);
        event.setPerformedByName(reporterName);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }

    public void createStatusChangeEvent(String caseId, String changedByUserId, String changedByName, 
                                        String previousStatus, String newStatus, String reason) {
        CaseTimelineEvent event = new CaseTimelineEvent();
        event.setCaseId(caseId);
        event.setEventType(CaseTimelineEvent.EventType.STATUS_CHANGED);
        event.setTitle("Status Changed");
        event.setDescription("Status changed from " + previousStatus + " to " + newStatus + 
                           (reason != null ? " (Reason: " + reason + ")" : ""));
        event.setPerformedByUserId(changedByUserId);
        event.setPerformedByName(changedByName);
        event.setEventTime(LocalDateTime.now());
        timelineEventRepository.save(event);
    }
}
