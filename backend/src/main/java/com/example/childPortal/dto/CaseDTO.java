package com.example.childPortal.dto;

import com.example.childPortal.model.CaseType;
import com.example.childPortal.model.Priority;
import com.example.childPortal.model.Case.CaseStatus;
import java.time.LocalDateTime;
import java.util.List;

public class CaseDTO {
    private String id;
    private String trackingId;
    private String reporterUserId;
    private boolean anonymous;
    private String reporterName;
    private String approximateAge;
    private String gender;
    private String identificationMarks;
    private CaseType caseType;
    private String location;
    private LocalDateTime incidentDate;
    private String caseDescription;
    private List<String> evidenceUrls;
    private CaseStatus status;
    private String assignedOfficerId;
    private String assignedWorkerId;
    private String assignedOfficerName;
    private String assignedWorkerName;
    private LocalDateTime reportDate;
    private LocalDateTime lastUpdated;

    public CaseDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReporterUserId() { return reporterUserId; }
    public void setReporterUserId(String reporterUserId) { this.reporterUserId = reporterUserId; }

    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getApproximateAge() { return approximateAge; }
    public void setApproximateAge(String approximateAge) { this.approximateAge = approximateAge; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getIdentificationMarks() { return identificationMarks; }
    public void setIdentificationMarks(String identificationMarks) { this.identificationMarks = identificationMarks; }

    public CaseType getCaseType() { return caseType; }
    public void setCaseType(CaseType caseType) { this.caseType = caseType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDateTime incidentDate) { this.incidentDate = incidentDate; }

    public String getCaseDescription() { return caseDescription; }
    public void setCaseDescription(String caseDescription) { this.caseDescription = caseDescription; }

    public List<String> getEvidenceUrls() { return evidenceUrls; }
    public void setEvidenceUrls(List<String> evidenceUrls) { this.evidenceUrls = evidenceUrls; }

    public CaseStatus getStatus() { return status; }
    public void setStatus(CaseStatus status) { this.status = status; }

    public String getAssignedOfficerId() { return assignedOfficerId; }
    public void setAssignedOfficerId(String assignedOfficerId) { this.assignedOfficerId = assignedOfficerId; }

    public String getAssignedWorkerId() { return assignedWorkerId; }
    public void setAssignedWorkerId(String assignedWorkerId) { this.assignedWorkerId = assignedWorkerId; }

    public String getAssignedOfficerName() { return assignedOfficerName; }
    public void setAssignedOfficerName(String assignedOfficerName) { this.assignedOfficerName = assignedOfficerName; }

    public String getAssignedWorkerName() { return assignedWorkerName; }
    public void setAssignedWorkerName(String assignedWorkerName) { this.assignedWorkerName = assignedWorkerName; }

    public LocalDateTime getReportDate() { return reportDate; }
    public void setReportDate(LocalDateTime reportDate) { this.reportDate = reportDate; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getTrackingId() {
        return trackingId;
    }
    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public void setPriority(Priority priority) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setPriority'");
    }

    public void setEmergency(boolean emergency) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setEmergency'");
    }
}