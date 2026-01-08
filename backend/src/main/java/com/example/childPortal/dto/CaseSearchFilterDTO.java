package com.example.childPortal.dto;

import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.CaseType;
import com.example.childPortal.model.Priority;
import java.time.LocalDateTime;

public class CaseSearchFilterDTO {
    private String keyword;
    private CaseType caseType;
    private CaseStatus status;
    private Priority priority;
    private String location;
    private String approximateAge;
    private String gender;
    private Boolean emergency;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String assignedOfficerId;
    private String assignedWorkerId;
    private String reporterUserId;
    private Boolean anonymous;

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public CaseType getCaseType() {
        return caseType;
    }

    public void setCaseType(CaseType caseType) {
        this.caseType = caseType;
    }

    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public Boolean getEmergency() {
        return emergency;
    }

    public void setEmergency(Boolean emergency) {
        this.emergency = emergency;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
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

    public String getReporterUserId() {
        return reporterUserId;
    }

    public void setReporterUserId(String reporterUserId) {
        this.reporterUserId = reporterUserId;
    }

    public Boolean getAnonymous() {
        return anonymous;
    }

    public void setAnonymous(Boolean anonymous) {
        this.anonymous = anonymous;
    }

    public boolean hasFilters() {
        return keyword != null || caseType != null || status != null ||
               priority != null || location != null || approximateAge != null ||
               gender != null || emergency != null || startDate != null || endDate != null ||
               assignedOfficerId != null || assignedWorkerId != null ||
               reporterUserId != null || anonymous != null;
    }
}

