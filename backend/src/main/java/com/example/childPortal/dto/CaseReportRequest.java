package com.example.childPortal.dto;

import com.example.childPortal.model.CaseType;
import com.example.childPortal.model.Priority; 
import java.time.LocalDateTime;
import java.util.List;

public class CaseReportRequest {
    private boolean anonymous;
    
    // Child Identification
    private String approximateAge;
    private String gender;
    private String identificationMarks;
    
    // Case Details
    private CaseType caseType;
    private String location;
    private LocalDateTime incidentDate;
    private String caseDescription;
    
    // Evidence
    private List<String> evidenceUrls;

    public CaseReportRequest() {}

    // Getters and Setters
    public boolean isAnonymous() { return anonymous; }
    public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }

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
}
