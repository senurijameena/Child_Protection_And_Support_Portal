package com.example.childPortal.dto;

import com.example.childPortal.model.CaseType;
import com.example.childPortal.model.Priority;
import com.example.childPortal.model.Case.CaseStatus; 
import java.time.LocalDateTime;
import java.util.List;

public class CaseApproveDTO {

private String id;
private String trackingId;
private CaseType caseType;
private String submittedBy;
private String reporterName;
private boolean anonymous;
private String trackingCode; 

private String approximateAge; 
private String gender;
private String location;
private LocalDateTime incidentDate; 
private String caseDescription;

private List<String> evidenceUrls;

private Priority priority;
private boolean emergency;
private CaseStatus status;
private LocalDateTime submissionDate;

private boolean immediateDanger; 
private boolean childInDistress; 
private boolean timeSensitive; 
private String priorityReason;

public CaseApproveDTO() {}

public String getId() { return id; }
public void setId(String id) { this.id = id; }

public String getTrackingId() { return trackingId; }
public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

public CaseType getCaseType() { return caseType; }
public void setCaseType(CaseType caseType) { this.caseType = caseType; }

public String getSubmittedBy() { return submittedBy; }
public void setSubmittedBy(String submittedBy) { this.submittedBy = submittedBy; }

public String getReporterName() { return reporterName; }
public void setReporterName(String reporterName) { this.reporterName = reporterName; }

public boolean isAnonymous() { return anonymous; }
public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }

public String getTrackingCode() { return trackingCode; }
public void setTrackingCode(String trackingCode) { this.trackingCode = trackingCode; }

public String getApproximateAge() { return approximateAge; }
public void setApproximateAge(String approximateAge) { this.approximateAge = approximateAge; }

public String getGender() { return gender; }
public void setGender(String gender) { this.gender = gender; }

public String getLocation() { return location; }
public void setLocation(String location) { this.location = location; }

public LocalDateTime getIncidentDate() { return incidentDate; }
public void setIncidentDate(LocalDateTime incidentDate) { this.incidentDate = incidentDate; }

public String getCaseDescription() { return caseDescription; }
public void setCaseDescription(String caseDescription) { this.caseDescription = caseDescription; }

public List<String> getEvidenceUrls() { return evidenceUrls; }
public void setEvidenceUrls(List<String> evidenceUrls) { this.evidenceUrls = evidenceUrls; }

public Priority getPriority() { return priority; }
public void setPriority(Priority priority) { this.priority = priority; }

public boolean isEmergency() { return emergency; }
public void setEmergency(boolean emergency) { this.emergency = emergency; }

public CaseStatus getStatus() { return status; }
public void setStatus(CaseStatus status) { this.status = status; }

public LocalDateTime getSubmissionDate() { return submissionDate; }
public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

public boolean isImmediateDanger() { return immediateDanger; }
public void setImmediateDanger(boolean immediateDanger) { this.immediateDanger = immediateDanger; }

public boolean isChildInDistress() { return childInDistress; }
public void setChildInDistress(boolean childInDistress) { this.childInDistress = childInDistress; }

public boolean isTimeSensitive() { return timeSensitive; }
public void setTimeSensitive(boolean timeSensitive) { this.timeSensitive = timeSensitive; }

public String getPriorityReason() { return priorityReason; }
public void setPriorityReason(String priorityReason) { this.priorityReason = priorityReason; }

}


