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
  List<CaseTimelineDTO> getRecentActivity(int limit);
  long getEventCountForCase(String caseId);
  void deleteTimelineEvent(String eventId);
}
