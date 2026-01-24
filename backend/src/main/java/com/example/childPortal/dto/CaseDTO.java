package com.example.childPortal.dto;

import com.example.childPortal.model.CaseType;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.Priority;
import com.example.childPortal.model.Role;
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
    private String assignedStationId;
    private String assignedWorkerId;
    private LocalDateTime reportDate;
    private Priority priority;
    private boolean emergency;

    public static CaseDTO createFilteredDTO(com.example.childPortal.model.Case caseEntity,
            Role userRole,
            String userId) {
        CaseDTO dto = new CaseDTO();
        dto.setId(caseEntity.getId());
        dto.setTrackingId(caseEntity.getTrackingId());
        dto.setReporterUserId(caseEntity.getReporterUserId());
        dto.setAnonymous(caseEntity.isAnonymous());
        dto.setApproximateAge(caseEntity.getApproximateAge());
        dto.setGender(caseEntity.getGender());
        dto.setIdentificationMarks(caseEntity.getIdentificationMarks());
        dto.setCaseType(caseEntity.getCaseType());
        dto.setLocation(caseEntity.getLocation());
        dto.setIncidentDate(caseEntity.getIncidentDate());
        dto.setCaseDescription(caseEntity.getCaseDescription());
        dto.setEvidenceUrls(caseEntity.getEvidenceUrls());
        dto.setStatus(caseEntity.getStatus());
        dto.setAssignedOfficerId(caseEntity.getAssignedOfficerId());
        dto.setAssignedStationId(caseEntity.getAssignedStationId());
        dto.setAssignedWorkerId(caseEntity.getAssignedWorkerId());
        dto.setReportDate(caseEntity.getReportDate());
        dto.setPriority(caseEntity.getPriority());
        dto.setEmergency(caseEntity.isEmergency());

        if (caseEntity.isAnonymous()) {
            if (userRole == Role.ADMIN ||
                    (caseEntity.getReporterUserId() != null &&
                            caseEntity.getReporterUserId().equals(userId))) {
                dto.setReporterName(caseEntity.getReporterName());
            } else {
                dto.setReporterName("Anonymous Reporter");
            }
        } else {
            dto.setReporterName(caseEntity.getReporterName());
        }

        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTrackingId() {
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

    public String getAssignedStationId() {
        return assignedStationId;
    }

    public void setAssignedStationId(String assignedStationId) {
        this.assignedStationId = assignedStationId;
    }

    public String getAssignedWorkerId() {
        return assignedWorkerId;
    }

    public void setAssignedWorkerId(String assignedWorkerId) {
        this.assignedWorkerId = assignedWorkerId;
    }

    public LocalDateTime getReportDate() {
        return reportDate;
    }

    public void setReportDate(LocalDateTime reportDate) {
        this.reportDate = reportDate;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public void setEmergency(boolean emergency) {
        this.emergency = emergency;
    }

    public Priority getPriority() {
        return priority;
    }

    public boolean isEmergency() {
        return emergency;
    }
}
