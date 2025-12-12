package com.example.childPortal.service;

import com.example.childPortal.dto.CaseTimelineDTO;
import com.example.childPortal.dto.TimelineFilterDTO;

import java.util.List;

public interface CaseTimelineService {
  void createTimelineEvent(CaseTimelineDTO timelineDTO); 
  List<CaseTimelineDTO> getTimelineForCase(String caseId);
  List<CaseTimelineDTO> getTimelineForHelpRequest(String helpRequestId);
  List<CaseTimelineDTO> getFilteredTimeline(TimelineFilterDTO filter);
  CaseTimelineDTO getTimelineEvent(String eventId);
  void createCaseCreatedEvent(String caseId, String reporterUserId, String reporterName);
  void createStatusChangeEvent(String caseId, String changedByUserId, String changedByName,String previousStatus, String newStatus, String reason);
  void createAssignmentEvent(String caseId, String assignedByUserId, String assignedByName,String assignedToUserId, String assignedToName, String role);
  void createPriorityChangeEvent(String caseId, String changedByUserId, String changedByName,String previousPriority, String newPriority, String reason);
  void createInformationRequestEvent(String caseId, String requestedByUserId, String requestedByName,String requestedFromUserId, String requestedFromName);
  void createEvidenceAddedEvent(String caseId, String addedByUserId, String addedByName,String evidenceUrl, String description);
  void createCaseResolvedEvent(String caseId, String resolvedByUserId, String resolvedByName,String resolutionDetails); List<CaseTimelineDTO> getRecentActivity(int limit);
  long getEventCountForCase(String caseId);
  void deleteTimelineEvent(String eventId); 
}


