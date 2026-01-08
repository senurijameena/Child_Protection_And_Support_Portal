package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "cases")
public class Case {
    @Id
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
    private Priority priority;
    private boolean emergency;

    private LocalDateTime reportDate;
    private LocalDateTime lastUpdated;
    private LocalDateTime resolutionDate;

    private String caseNotes;

    public enum CaseStatus {
        REPORTED,
        UNDER_REVIEW,
        ASSIGNED,
        INVESTIGATING,
        RESOLVED,
        CLOSED,
        REJECTED
    }

    public Case() {
        this.reportDate = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
        this.status = CaseStatus.REPORTED;
        this.priority = Priority.MEDIUM;
    }

    public String generateTrackingId() {
        // This is a fallback method - tracking IDs should be set in the service layer
        String prefix = this.anonymous ? "ANON-C-" : "CASE-";
        return prefix + (this.id != null ? this.id.substring(0, Math.min(4, this.id.length())) : "UNKNOWN");
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTrackingId() {
        if (trackingId == null) {
            return generateTrackingId();
        }
        return trackingId;
    }

    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public String getReporterUserId() {
        return reporterUserId;
    }

    public void setReporterUserId(String reporterUserId) {
        this.reporterUserId = reporterUserId;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public String getApproximateAge() {
        return approximateAge;
    }

    public void setApproximateAge(String approximateAge) {
        this.approximateAge = approximateAge;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getIdentificationMarks() {
        return identificationMarks;
    }

    public void setIdentificationMarks(String identificationMarks) {
        this.identificationMarks = identificationMarks;
    }

    public CaseType getCaseType() {
        return caseType;
    }

    public void setCaseType(CaseType caseType) {
        this.caseType = caseType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getIncidentDate() {
        return incidentDate;
    }

    public void setIncidentDate(LocalDateTime incidentDate) {
        this.incidentDate = incidentDate;
    }

    public String getCaseDescription() {
        return caseDescription;
    }

    public void setCaseDescription(String caseDescription) {
        this.caseDescription = caseDescription;
    }

    public List<String> getEvidenceUrls() {
        return evidenceUrls;
    }

    public void setEvidenceUrls(List<String> evidenceUrls) {
        this.evidenceUrls = evidenceUrls;
    }

    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }

    public String getAssignedOfficerId() {
        return assignedOfficerId;
    }

    public void setAssignedOfficerId(String assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
    }

    public String getAssignedWorkerId() {
        return assignedWorkerId;
    }

    public void setAssignedWorkerId(String assignedWorkerId) {
        this.assignedWorkerId = assignedWorkerId;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public boolean isEmergency() {
        return emergency;
    }

    public void setEmergency(boolean emergency) {
        this.emergency = emergency;
    }

    public LocalDateTime getReportDate() {
        return reportDate;
    }

    public void setReportDate(LocalDateTime reportDate) {
        this.reportDate = reportDate;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public LocalDateTime getResolutionDate() {
        return resolutionDate;
    }

    public void setResolutionDate(LocalDateTime resolutionDate) {
        this.resolutionDate = resolutionDate;
    }

    public String getCaseNotes() {
        return caseNotes;
    }

    public void setCaseNotes(String caseNotes) {
        this.caseNotes = caseNotes;
    }

}