package com.example.childPortal.service.impl;

import com.example.childPortal.dto.CaseTimelineDTO;
import com.example.childPortal.dto.TimelineFilterDTO;
import com.example.childPortal.service.CaseTimelineService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CaseTimelineServiceImpl implements CaseTimelineService {

    @Override
    public void createTimelineEvent(CaseTimelineDTO timelineDTO) {
        System.out.println("Timeline event created: " + timelineDTO.getDescription());
    }

    @Override
    public List<CaseTimelineDTO> getTimelineForCase(String caseId) {
        List<CaseTimelineDTO> timeline = new ArrayList<>();
 
        if (!caseId.isEmpty()) {
            CaseTimelineDTO dummyEvent = new CaseTimelineDTO();
            dummyEvent.setId("dummy-" + caseId);
            dummyEvent.setCaseId(caseId);
            dummyEvent.setEventType(com.example.childPortal.model.CaseTimelineEvent.EventType.CASE_CREATED);
            dummyEvent.setDescription("Case was created");
            dummyEvent.setPerformedByName("System");
            dummyEvent.setEventTime(LocalDateTime.now());
            timeline.add(dummyEvent);
        }
        
        return timeline;
    }

    @Override
    public List<CaseTimelineDTO> getTimelineForHelpRequest(String helpRequestId) {
        List<CaseTimelineDTO> timeline = new ArrayList<>();
        
        if (!helpRequestId.isEmpty()) {
            CaseTimelineDTO dummyEvent = new CaseTimelineDTO();
            dummyEvent.setId("dummy-hr-" + helpRequestId);
            dummyEvent.setHelpRequestId(helpRequestId);
            dummyEvent.setEventType(com.example.childPortal.model.CaseTimelineEvent.EventType.CASE_CREATED);
            dummyEvent.setDescription("Help request was created");
            dummyEvent.setPerformedByName("System");
            dummyEvent.setEventTime(LocalDateTime.now());
            timeline.add(dummyEvent);
        }
        
        return timeline;
    }

    @Override
    public List<CaseTimelineDTO> getFilteredTimeline(TimelineFilterDTO filter) {
        List<CaseTimelineDTO> filteredEvents = new ArrayList<>();
        return filteredEvents;
    }

    @Override
    public CaseTimelineDTO getTimelineEvent(String eventId) {
        return null;
    }

    @Override
    public List<CaseTimelineDTO> getRecentActivity(int limit) {
        List<CaseTimelineDTO> recentActivity = new ArrayList<>();
        
        for (int i = 1; i <= Math.min(limit, 5); i++) {
            CaseTimelineDTO event = new CaseTimelineDTO();
            event.setId("recent-" + i);
            event.setCaseId("case-" + i);
            event.setEventType(com.example.childPortal.model.CaseTimelineEvent.EventType.CASE_CREATED);
            event.setDescription("Recent activity " + i);
            event.setPerformedByName("User " + i);
            event.setEventTime(LocalDateTime.now().minusHours(i));
            recentActivity.add(event);
        }
        
        return recentActivity;
    }

    @Override
    public long getEventCountForCase(String caseId) {
        return 0L;
    }

    @Override
    public void deleteTimelineEvent(String eventId) {
        System.out.println("Deleting timeline event: " + eventId);
    }
    public void createCaseCreatedEvent(String caseId, String reporterUserId, String reporterName) {
        CaseTimelineDTO event = new CaseTimelineDTO();
        event.setCaseId(caseId);
        event.setEventType(com.example.childPortal.model.CaseTimelineEvent.EventType.CASE_CREATED);
        event.setDescription("Case created by " + reporterName);
        event.setPerformedByUserId(reporterUserId);
        event.setPerformedByName(reporterName);
        event.setEventTime(LocalDateTime.now());
        createTimelineEvent(event);
    }

    public void createStatusChangeEvent(String caseId, String changedByUserId, String changedByName, 
                                        String previousStatus, String newStatus, String reason) {
        CaseTimelineDTO event = new CaseTimelineDTO();
        event.setCaseId(caseId);
        event.setEventType(com.example.childPortal.model.CaseTimelineEvent.EventType.STATUS_CHANGED);
        event.setDescription("Status changed from " + previousStatus + " to " + newStatus + 
                           (reason != null ? " (Reason: " + reason + ")" : ""));
        event.setPerformedByUserId(changedByUserId);
        event.setPerformedByName(changedByName);
        event.setEventTime(LocalDateTime.now());
        createTimelineEvent(event);
    }
}
