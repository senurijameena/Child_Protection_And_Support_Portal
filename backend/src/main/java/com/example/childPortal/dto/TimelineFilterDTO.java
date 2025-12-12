package com.example.childPortal.dto;

import com.example.childPortal.model.CaseTimelineEvent.EventType; 
import com.example.childPortal.model.Role;
import java.time.LocalDateTime;
import java.util.List;

public class TimelineFilterDTO {
private String caseId;
private String helpRequestId;
private List<EventType> eventTypes; 
private List<Role> performedByRoles; 
private String performedByUserId; 
private LocalDateTime startDate; 
private LocalDateTime endDate; 
private boolean showSystemEvents; 
private boolean showUserActions; 
private boolean showMajorEventsOnly; 
private String searchText;
private int page; 
private int pageSize;

public TimelineFilterDTO() { 
    this.page = 0;
    this.pageSize = 20; 
    this.showSystemEvents = true; 
    this.showUserActions = true;
}

public String getCaseId() { return caseId; }
public void setCaseId(String caseId) { this.caseId = caseId; }
public String getHelpRequestId() { return helpRequestId; }
 public void setHelpRequestId(String helpRequestId) { this.helpRequestId =
 helpRequestId; }
public List<EventType> getEventTypes() { return eventTypes; }
public void setEventTypes(List<EventType> eventTypes) { this.eventTypes = eventTypes; }
public List<Role> getPerformedByRoles() { return performedByRoles; }
public void setPerformedByRoles(List<Role> performedByRoles) { this.performedByRoles = performedByRoles; }
public String getPerformedByUserId() { return performedByUserId; }
public void setPerformedByUserId(String performedByUserId) { this.performedByUserId = performedByUserId; }
public LocalDateTime getStartDate() { return startDate; }
public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
public LocalDateTime getEndDate() { return endDate; }
public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
public boolean isShowSystemEvents() { return showSystemEvents; }
 public void setShowSystemEvents(boolean showSystemEvents) {
 this.showSystemEvents = showSystemEvents; }
public boolean isShowUserActions() { return showUserActions; }
 public void setShowUserActions(boolean showUserActions) {
 this.showUserActions = showUserActions; }
public boolean isShowMajorEventsOnly() { return showMajorEventsOnly; }
public boolean isShowMajorEventsOnly() { return showMajorEventsOnly; }
 public void setShowMajorEventsOnly(boolean showMajorEventsOnly) {
 this.showMajorEventsOnly = showMajorEventsOnly; }
public String getSearchText() { return searchText; }
public void setSearchText(String searchText) { this.searchText = searchText; }
public int getPage() { return page; }
public void setPage(int page) { this.page = page; }
public int getPageSize() { return pageSize; }
public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}

