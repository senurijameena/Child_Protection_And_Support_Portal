package com.example.childPortal.dto;

import com.example.childPortal.model.Priority;
import com.example.childPortal.model.CaseType;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.HelpRequest.RequestStatus; 
import java.time.LocalDateTime;


public class AdminDashboardDTO {

private long totalCases;
private long pendingCases;
private long emergencyCases; 
private long totalHelpRequests; 
private long pendingHelpRequests; 
private long totalUsers;
private long pendingApprovalUsers;


private java.util.List<CaseApproveDTO> newCases;
private java.util.List<HelpRequestApproveDTO> newHelpRequests; 
private java.util.List<EmergencyCaseDTO> emergencyCaseList;

private java.util.List<ActivityDTO> recentActivity;

public AdminDashboardDTO() {}

public long getTotalCases() { return totalCases;}
public void setTotalCases(long totalCases) { this.totalCases = totalCases; }

public long getPendingCases() { return pendingCases; }
public void setPendingCases(long pendingCases) { this.pendingCases = pendingCases; }


public long getEmergencyCases() { return emergencyCases; }
public void setEmergencyCases(long emergencyCases) { this.emergencyCases = emergencyCases; }

public long getTotalHelpRequests() { return totalHelpRequests; }
public void setTotalHelpRequests(long totalHelpRequests) { this.totalHelpRequests = totalHelpRequests; }

public long getPendingHelpRequests() { return pendingHelpRequests; }
public void setPendingHelpRequests(long pendingHelpRequests) { this.pendingHelpRequests = pendingHelpRequests; }

public long getTotalUsers() { return totalUsers; }
public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

public long getPendingApprovalUsers() { return pendingApprovalUsers; }
public void setPendingApprovalUsers(long pendingApprovalUsers) { this.pendingApprovalUsers = pendingApprovalUsers; }

public java.util.List<CaseApproveDTO> getNewCases() { return newCases; }
public void setNewCases(java.util.List<CaseApproveDTO> newCases) { this.newCases = newCases; }

public java.util.List<HelpRequestApproveDTO> getNewHelpRequests() { return newHelpRequests; }
public void setNewHelpRequests(java.util.List<HelpRequestApproveDTO> newHelpRequests) { this.newHelpRequests = newHelpRequests; }

public java.util.List<EmergencyCaseDTO> getEmergencyCaseList() { return emergencyCaseList; }
public void setEmergencyCaseList(java.util.List<EmergencyCaseDTO> emergencyCaseList) { this.emergencyCaseList = emergencyCaseList; }

public java.util.List<ActivityDTO> getRecentActivity() { return recentActivity; }

public void setRecentActivity(java.util.List<ActivityDTO> recentActivity) { this.recentActivity = recentActivity; }


public static class EmergencyCaseDTO {
private String caseId;
private String trackingId;
private CaseType caseType;
private String reporterName;
private Priority priority;
private LocalDateTime submissionDate; private String location;

public String getCaseId() { return caseId; }
public void setCaseId(String caseId) { this.caseId = caseId; }

public String getTrackingId() { return trackingId; }
public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

public CaseType getCaseType() { return caseType; }
public void setCaseType(CaseType caseType) { this.caseType = caseType; }

public String getReporterName() { return reporterName; }
public void setReporterName(String reporterName) { this.reporterName = reporterName; }

public Priority getPriority() { return priority; }
public void setPriority(Priority priority) { this.priority = priority; }

public LocalDateTime getSubmissionDate() { return submissionDate; }
public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

public String getLocation() { return location; }
public void setLocation(String location) { this.location = location; }
}


public static class ActivityDTO {
private String activityType;
private String description;
private LocalDateTime timestamp; 
private String performedBy; 
private String entityId;

public String getActivityType() { return activityType; }
public void setActivityType(String activityType) { this.activityType = activityType; }

public String getDescription() { return description; }
public void setDescription(String description) { this.description = description; }

public LocalDateTime getTimestamp() { return timestamp; }
public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

public String getPerformedBy() { return performedBy; }
public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

public String getEntityId() { return entityId; }
public void setEntityId(String entityId) { this.entityId = entityId; } 
}


}