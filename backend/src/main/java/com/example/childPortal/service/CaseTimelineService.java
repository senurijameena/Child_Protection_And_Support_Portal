package com.example.childPortal.service;

import com.example.childPortal.dto.CaseTimelineDTO;
import com.example.childPortal.dto.TimelineFilterDTO;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import java.util.List;

public interface CaseTimelineService {

  void createTimelineEvent(CaseTimelineDTO timelineDTO); 
  List<CaseTimelineDTO> getTimelineForCase(String caseId);
  List<CaseTimelineDTO> getTimelineForHelpRequest(String helpRequestId);
  List<CaseTimelineDTO> getFilteredTimeline(TimelineFilterDTO filter);
  CaseTimelineDTO getTimelineEvent(String eventId);
  List<CaseTimelineDTO> getRecentActivity(int limit);
  long getEventCountForCase(String caseId);
  void deleteTimelineEvent(String eventId);

  void createHelpRequestCreatedEvent(String helpRequestId, String requesterUserId, String requesterName);
  void createHelpRequestStatusChangeEvent(String helpRequestId, String changedByUserId, 
                                         String changedByName, RequestStatus previousStatus, 
                                         RequestStatus newStatus, String reason);
  void createHelpRequestAssignedEvent(String helpRequestId, String assignedToUserId, 
                                     String assignedToName, String assignedByUserId, 
                                     String assignedByName);
  void createServiceOfferCreatedEvent(String helpRequestId, String serviceOfferId, 
                                      String workerId, String workerName);
  void createServiceOfferAcceptedEvent(String helpRequestId, String serviceOfferId, 
                                      String acceptedByUserId, String acceptedByName);
  void createServiceCompletedEvent(String helpRequestId, String serviceOfferId, 
                                  String completedByUserId, String completedByName);
  void createHelpRequestTransferEvent(String helpRequestId, String transferRequestId, 
                                     String fromUserId, String toUserId, 
                                     String requestedByUserId, String requestedByName);
  void createHelpRequestNoteAddedEvent(String helpRequestId, String addedByUserId, 
                                      String addedByName, String note);
  long getEventCountForHelpRequest(String helpRequestId);

  void createCaseCreatedEvent(String caseId, String reporterUserId, String reporterName);
  void createStatusChangeEvent(String caseId, String changedByUserId, String changedByName, 
                               String previousStatus, String newStatus, String reason);
}
