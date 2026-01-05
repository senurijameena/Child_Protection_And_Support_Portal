package com.example.childPortal.dto;

import com.example.childPortal.model.CaseTimelineEvent.EventType;
import java.time.LocalDateTime;
import java.util.List;

public class TimelineFilterDTO {
    private String caseId;
    private String helpRequestId;
    private List<EventType> eventTypes;
    private String performedByUserId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String searchText;
    private String sortBy; // "date_asc", "date_desc"
    private Integer limit;
    
    public TimelineFilterDTO() {}

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    
    public List<EventType> getEventTypes() { return eventTypes; }
    public void setEventTypes(List<EventType> eventTypes) { this.eventTypes = eventTypes; }
    
    public String getPerformedByUserId() { return performedByUserId; }
    public void setPerformedByUserId(String performedByUserId) { this.performedByUserId = performedByUserId; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public String getSearchText() { return searchText; }
    public void setSearchText(String searchText) { this.searchText = searchText; }
    
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    
    public Integer getLimit() { return limit; }
    public void setLimit(Integer limit) { this.limit = limit; }
}
