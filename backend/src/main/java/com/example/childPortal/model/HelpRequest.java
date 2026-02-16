package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "help_requests")
public class HelpRequest {
    @Id
    private String id;
    private String trackingId;
    private String requesterUserId;
    private boolean anonymous;
    private String requesterName;

    private String approximateAge;
    private String gender;
    private String identificationMarks;

    private HelpType helpType;
    private String description;
    private String location;
    private List<String> documentUrls;

    private RequestStatus status;
    private String assignedWorkerId;
    private Priority priority;

    private LocalDateTime requestDate;
    private LocalDateTime lastUpdated;
    private LocalDateTime completionDate;
    private LocalDateTime closedDate;
    private LocalDateTime archivedDate;

    private String requestNotes;

    // Service Execution Progress Tracking
    private Integer progress; // 0-100 percentage
    private LocalDateTime serviceStartedAt;
    private LocalDateTime serviceFinalizedAt;
    private LocalDateTime finalAssessmentAt;

    // Service execution flags
    private boolean serviceStarted;
    private boolean resourcesAssigned;
    private boolean allServicesCompleted;
    private boolean finalAssessmentCompleted;
    private boolean caseFinalized;

    private FinalAssessment finalAssessment;

    public FinalAssessment getFinalAssessment() {
        return finalAssessment;
    }

    public void setFinalAssessment(FinalAssessment finalAssessment) {
        this.finalAssessment = finalAssessment;
    }

    // Service package proposed by social worker for this help request
    private String appliedServicePackageId;
    private LocalDateTime appliedServicePackageAppliedAt;
    /**
     * Simple string status for the applied package: PENDING, ACCEPTED, REJECTED,
     * etc.
     */
    private String appliedServicePackageStatus;

    /**
     * Per-service execution status. Populated when PU accepts the package.
     * Each item: PENDING -> IN_PROGRESS / SCHEDULED -> COMPLETED.
     */
    private java.util.List<ServiceItemExecution> appliedPackageItemExecutions;

    public java.util.List<ServiceItemExecution> getAppliedPackageItemExecutions() {
        return appliedPackageItemExecutions;
    }

    public void setAppliedPackageItemExecutions(java.util.List<ServiceItemExecution> appliedPackageItemExecutions) {
        this.appliedPackageItemExecutions = appliedPackageItemExecutions;
    }

    public enum RequestStatus {
        REQUESTED,
        UNDER_REVIEW,
        ASSIGNED,
        PACKAGE_PROPOSED,
        IN_PROGRESS,
        COMPLETED,
        CLOSED,
        ARCHIVED,
        REJECTED,
        PACKAGE_REJECTED,
        CANCELLED
    }

    public HelpRequest() {
        this.requestDate = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
        this.status = RequestStatus.REQUESTED;
        this.priority = Priority.MEDIUM;
    }

    public String generateTrackingId() {
        // This is a fallback method - tracking IDs should be set in the service layer
        String prefix = this.anonymous ? "ANON H-" : "HELP-";
        return prefix + (this.id != null ? this.id.substring(0, Math.min(4, this.id.length())) : "UNKNOWN");
    }

    public String getIdentificationMarks() {
        return identificationMarks;
    }

    public void setIdentificationMarks(String identificationMarks) {
        this.identificationMarks = identificationMarks;
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

    public String getRequesterUserId() {
        return requesterUserId;
    }

    public void setRequesterUserId(String requesterUserId) {
        this.requesterUserId = requesterUserId;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
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

    public HelpType getHelpType() {
        return helpType;
    }

    public void setHelpType(HelpType helpType) {
        this.helpType = helpType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getDocumentUrls() {
        return documentUrls;
    }

    public void setDocumentUrls(List<String> documentUrls) {
        this.documentUrls = documentUrls;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
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

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }

    public LocalDateTime getClosedDate() {
        return closedDate;
    }

    public void setClosedDate(LocalDateTime closedDate) {
        this.closedDate = closedDate;
    }

    public LocalDateTime getArchivedDate() {
        return archivedDate;
    }

    public void setArchivedDate(LocalDateTime archivedDate) {
        this.archivedDate = archivedDate;
    }

    public String getRequestNotes() {
        return requestNotes;
    }

    public void setRequestNotes(String requestNotes) {
        this.requestNotes = requestNotes;
    }

    public String getAppliedServicePackageId() {
        return appliedServicePackageId;
    }

    public void setAppliedServicePackageId(String appliedServicePackageId) {
        this.appliedServicePackageId = appliedServicePackageId;
    }

    public LocalDateTime getAppliedServicePackageAppliedAt() {
        return appliedServicePackageAppliedAt;
    }

    public void setAppliedServicePackageAppliedAt(LocalDateTime appliedServicePackageAppliedAt) {
        this.appliedServicePackageAppliedAt = appliedServicePackageAppliedAt;
    }

    public String getAppliedServicePackageStatus() {
        return appliedServicePackageStatus;
    }

    public void setAppliedServicePackageStatus(String appliedServicePackageStatus) {
        this.appliedServicePackageStatus = appliedServicePackageStatus;
    }

    // Progress and Service Execution Getters/Setters
    public Integer getProgress() {
        return progress != null ? progress : 0;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public LocalDateTime getServiceStartedAt() {
        return serviceStartedAt;
    }

    public void setServiceStartedAt(LocalDateTime serviceStartedAt) {
        this.serviceStartedAt = serviceStartedAt;
    }

    public LocalDateTime getServiceFinalizedAt() {
        return serviceFinalizedAt;
    }

    public void setServiceFinalizedAt(LocalDateTime serviceFinalizedAt) {
        this.serviceFinalizedAt = serviceFinalizedAt;
    }

    public LocalDateTime getFinalAssessmentAt() {
        return finalAssessmentAt;
    }

    public void setFinalAssessmentAt(LocalDateTime finalAssessmentAt) {
        this.finalAssessmentAt = finalAssessmentAt;
    }

    public boolean isServiceStarted() {
        return serviceStarted;
    }

    public void setServiceStarted(boolean serviceStarted) {
        this.serviceStarted = serviceStarted;
    }

    public boolean isResourcesAssigned() {
        return resourcesAssigned;
    }

    public void setResourcesAssigned(boolean resourcesAssigned) {
        this.resourcesAssigned = resourcesAssigned;
    }

    public boolean isAllServicesCompleted() {
        return allServicesCompleted;
    }

    public void setAllServicesCompleted(boolean allServicesCompleted) {
        this.allServicesCompleted = allServicesCompleted;
    }

    public boolean isFinalAssessmentCompleted() {
        return finalAssessmentCompleted;
    }

    public void setFinalAssessmentCompleted(boolean finalAssessmentCompleted) {
        this.finalAssessmentCompleted = finalAssessmentCompleted;
    }

    public boolean isCaseFinalized() {
        return caseFinalized;
    }

    public void setCaseFinalized(boolean caseFinalized) {
        this.caseFinalized = caseFinalized;
    }

    public static class FinalAssessment {
        private boolean objectivesAchieved;
        private boolean childSafe;
        private boolean needsContinuedMonitoring;
        private boolean recommendClosure;
        private String remarks;
        private LocalDateTime assessedAt;
        private String assessedByUserId;

        public boolean isObjectivesAchieved() { return objectivesAchieved; }
        public void setObjectivesAchieved(boolean objectivesAchieved) { this.objectivesAchieved = objectivesAchieved; }

        public boolean isChildSafe() { return childSafe; }
        public void setChildSafe(boolean childSafe) { this.childSafe = childSafe; }
        
        public boolean isNeedsContinuedMonitoring() { return needsContinuedMonitoring; }
        public void setNeedsContinuedMonitoring(boolean needsContinuedMonitoring) { this.needsContinuedMonitoring = needsContinuedMonitoring; }
        
        public boolean isRecommendClosure() { return recommendClosure; }
        public void setRecommendClosure(boolean recommendClosure) { this.recommendClosure = recommendClosure; }
        
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
        
        public LocalDateTime getAssessedAt() { return assessedAt; }
        public void setAssessedAt(LocalDateTime assessedAt) { this.assessedAt = assessedAt; }
        
        public String getAssessedByUserId() { return assessedByUserId; }
        public void setAssessedByUserId(String assessedByUserId) { this.assessedByUserId = assessedByUserId; }
    }
}
