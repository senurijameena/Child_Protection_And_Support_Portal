package com.example.childPortal.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CompletedHelpRequestReportDTO {
    private ReportHeader reportHeader;
    private HelpSummary helpSummary;
    private PublicUserInfo publicUserInfo;
    private InitialRequestDetails initialRequestDetails;
    private ServicePackageDetails servicePackageDetails;
    private List<ResourceAllocationDetail> resourceAllocationDetails;
    private List<ServiceTimelineItem> serviceTimeline;
    private FollowUpMonitoringSummary followUpMonitoringSummary;
    private OutcomeAssessment outcomeAssessment;
    private List<String> challengesFaced;
    private List<String> recommendations;
    private List<String> attachments;
    private FinalDeclaration finalDeclaration;
    private String aiGeneratedSummary;
    private String workflowStatus;
    private String adminReviewNote;

    public CompletedHelpRequestReportDTO() {
        this.resourceAllocationDetails = new ArrayList<>();
        this.serviceTimeline = new ArrayList<>();
        this.challengesFaced = new ArrayList<>();
        this.recommendations = new ArrayList<>();
        this.attachments = new ArrayList<>();
    }

    public ReportHeader getReportHeader() {
        return reportHeader;
    }

    public void setReportHeader(ReportHeader reportHeader) {
        this.reportHeader = reportHeader;
    }

    public HelpSummary getHelpSummary() {
        return helpSummary;
    }

    public void setHelpSummary(HelpSummary helpSummary) {
        this.helpSummary = helpSummary;
    }

    public PublicUserInfo getPublicUserInfo() {
        return publicUserInfo;
    }

    public void setPublicUserInfo(PublicUserInfo publicUserInfo) {
        this.publicUserInfo = publicUserInfo;
    }

    public InitialRequestDetails getInitialRequestDetails() {
        return initialRequestDetails;
    }

    public void setInitialRequestDetails(InitialRequestDetails initialRequestDetails) {
        this.initialRequestDetails = initialRequestDetails;
    }

    public ServicePackageDetails getServicePackageDetails() {
        return servicePackageDetails;
    }

    public void setServicePackageDetails(ServicePackageDetails servicePackageDetails) {
        this.servicePackageDetails = servicePackageDetails;
    }

    public List<ResourceAllocationDetail> getResourceAllocationDetails() {
        return resourceAllocationDetails;
    }

    public void setResourceAllocationDetails(List<ResourceAllocationDetail> resourceAllocationDetails) {
        this.resourceAllocationDetails = resourceAllocationDetails;
    }

    public List<ServiceTimelineItem> getServiceTimeline() {
        return serviceTimeline;
    }

    public void setServiceTimeline(List<ServiceTimelineItem> serviceTimeline) {
        this.serviceTimeline = serviceTimeline;
    }

    public FollowUpMonitoringSummary getFollowUpMonitoringSummary() {
        return followUpMonitoringSummary;
    }

    public void setFollowUpMonitoringSummary(FollowUpMonitoringSummary followUpMonitoringSummary) {
        this.followUpMonitoringSummary = followUpMonitoringSummary;
    }

    public OutcomeAssessment getOutcomeAssessment() {
        return outcomeAssessment;
    }

    public void setOutcomeAssessment(OutcomeAssessment outcomeAssessment) {
        this.outcomeAssessment = outcomeAssessment;
    }

    public List<String> getChallengesFaced() {
        return challengesFaced;
    }

    public void setChallengesFaced(List<String> challengesFaced) {
        this.challengesFaced = challengesFaced;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }

    public FinalDeclaration getFinalDeclaration() {
        return finalDeclaration;
    }

    public void setFinalDeclaration(FinalDeclaration finalDeclaration) {
        this.finalDeclaration = finalDeclaration;
    }

    public String getAiGeneratedSummary() {
        return aiGeneratedSummary;
    }

    public void setAiGeneratedSummary(String aiGeneratedSummary) {
        this.aiGeneratedSummary = aiGeneratedSummary;
    }

    public String getWorkflowStatus() {
        return workflowStatus;
    }

    public void setWorkflowStatus(String workflowStatus) {
        this.workflowStatus = workflowStatus;
    }

    public String getAdminReviewNote() {
        return adminReviewNote;
    }

    public void setAdminReviewNote(String adminReviewNote) {
        this.adminReviewNote = adminReviewNote;
    }

    public static class ReportHeader {
        private String organizationName;
        private String systemName;
        private String reportTitle;
        private String reportId;
        private LocalDateTime generatedDate;
        private String generatedBy;
        private String generatedById;
        private String helpId;

        public String getOrganizationName() {
            return organizationName;
        }

        public void setOrganizationName(String organizationName) {
            this.organizationName = organizationName;
        }

        public String getSystemName() {
            return systemName;
        }

        public void setSystemName(String systemName) {
            this.systemName = systemName;
        }

        public String getReportTitle() {
            return reportTitle;
        }

        public void setReportTitle(String reportTitle) {
            this.reportTitle = reportTitle;
        }

        public String getReportId() {
            return reportId;
        }

        public void setReportId(String reportId) {
            this.reportId = reportId;
        }

        public LocalDateTime getGeneratedDate() {
            return generatedDate;
        }

        public void setGeneratedDate(LocalDateTime generatedDate) {
            this.generatedDate = generatedDate;
        }

        public String getGeneratedBy() {
            return generatedBy;
        }

        public void setGeneratedBy(String generatedBy) {
            this.generatedBy = generatedBy;
        }

        public String getGeneratedById() {
            return generatedById;
        }

        public void setGeneratedById(String generatedById) {
            this.generatedById = generatedById;
        }

        public String getHelpId() {
            return helpId;
        }

        public void setHelpId(String helpId) {
            this.helpId = helpId;
        }
    }

    public static class HelpSummary {
        private String helpId;
        private String requestType;
        private String priorityLevel;
        private LocalDateTime dateSubmitted;
        private LocalDateTime dateAssignedToSW;
        private LocalDateTime dateServiceStarted;
        private LocalDateTime dateCompleted;
        private long totalDurationDays;
        private String status;

        public String getHelpId() {
            return helpId;
        }

        public void setHelpId(String helpId) {
            this.helpId = helpId;
        }

        public String getRequestType() {
            return requestType;
        }

        public void setRequestType(String requestType) {
            this.requestType = requestType;
        }

        public String getPriorityLevel() {
            return priorityLevel;
        }

        public void setPriorityLevel(String priorityLevel) {
            this.priorityLevel = priorityLevel;
        }

        public LocalDateTime getDateSubmitted() {
            return dateSubmitted;
        }

        public void setDateSubmitted(LocalDateTime dateSubmitted) {
            this.dateSubmitted = dateSubmitted;
        }

        public LocalDateTime getDateAssignedToSW() {
            return dateAssignedToSW;
        }

        public void setDateAssignedToSW(LocalDateTime dateAssignedToSW) {
            this.dateAssignedToSW = dateAssignedToSW;
        }

        public LocalDateTime getDateServiceStarted() {
            return dateServiceStarted;
        }

        public void setDateServiceStarted(LocalDateTime dateServiceStarted) {
            this.dateServiceStarted = dateServiceStarted;
        }

        public LocalDateTime getDateCompleted() {
            return dateCompleted;
        }

        public void setDateCompleted(LocalDateTime dateCompleted) {
            this.dateCompleted = dateCompleted;
        }

        public long getTotalDurationDays() {
            return totalDurationDays;
        }

        public void setTotalDurationDays(long totalDurationDays) {
            this.totalDurationDays = totalDurationDays;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class PublicUserInfo {
        private String name;
        private String contactNumber;
        private String districtOrLocation;
        private String vulnerabilityCategory;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getContactNumber() {
            return contactNumber;
        }

        public void setContactNumber(String contactNumber) {
            this.contactNumber = contactNumber;
        }

        public String getDistrictOrLocation() {
            return districtOrLocation;
        }

        public void setDistrictOrLocation(String districtOrLocation) {
            this.districtOrLocation = districtOrLocation;
        }

        public String getVulnerabilityCategory() {
            return vulnerabilityCategory;
        }

        public void setVulnerabilityCategory(String vulnerabilityCategory) {
            this.vulnerabilityCategory = vulnerabilityCategory;
        }
    }

    public static class InitialRequestDetails {
        private String problemDescription;
        private List<String> supportingDocuments;
        private String initialAssessmentSummary;

        public String getProblemDescription() {
            return problemDescription;
        }

        public void setProblemDescription(String problemDescription) {
            this.problemDescription = problemDescription;
        }

        public List<String> getSupportingDocuments() {
            return supportingDocuments;
        }

        public void setSupportingDocuments(List<String> supportingDocuments) {
            this.supportingDocuments = supportingDocuments;
        }

        public String getInitialAssessmentSummary() {
            return initialAssessmentSummary;
        }

        public void setInitialAssessmentSummary(String initialAssessmentSummary) {
            this.initialAssessmentSummary = initialAssessmentSummary;
        }
    }

    public static class ServicePackageDetails {
        private String packageName;
        private List<String> servicesIncluded;
        private LocalDateTime dateApplied;
        private LocalDateTime dateApprovedByPublicUser;
        private String adjustments;
        private List<String> finalApprovedServices;

        public String getPackageName() {
            return packageName;
        }

        public void setPackageName(String packageName) {
            this.packageName = packageName;
        }

        public List<String> getServicesIncluded() {
            return servicesIncluded;
        }

        public void setServicesIncluded(List<String> servicesIncluded) {
            this.servicesIncluded = servicesIncluded;
        }

        public LocalDateTime getDateApplied() {
            return dateApplied;
        }

        public void setDateApplied(LocalDateTime dateApplied) {
            this.dateApplied = dateApplied;
        }

        public LocalDateTime getDateApprovedByPublicUser() {
            return dateApprovedByPublicUser;
        }

        public void setDateApprovedByPublicUser(LocalDateTime dateApprovedByPublicUser) {
            this.dateApprovedByPublicUser = dateApprovedByPublicUser;
        }

        public String getAdjustments() {
            return adjustments;
        }

        public void setAdjustments(String adjustments) {
            this.adjustments = adjustments;
        }

        public List<String> getFinalApprovedServices() {
            return finalApprovedServices;
        }

        public void setFinalApprovedServices(List<String> finalApprovedServices) {
            this.finalApprovedServices = finalApprovedServices;
        }
    }

    public static class ResourceAllocationDetail {
        private String resourceName;
        private String resourceType;
        private LocalDateTime assignedDate;
        private String serviceProvided;
        private LocalDateTime completionDate;
        private List<String> supportingDocuments;

        public String getResourceName() {
            return resourceName;
        }

        public void setResourceName(String resourceName) {
            this.resourceName = resourceName;
        }

        public String getResourceType() {
            return resourceType;
        }

        public void setResourceType(String resourceType) {
            this.resourceType = resourceType;
        }

        public LocalDateTime getAssignedDate() {
            return assignedDate;
        }

        public void setAssignedDate(LocalDateTime assignedDate) {
            this.assignedDate = assignedDate;
        }

        public String getServiceProvided() {
            return serviceProvided;
        }

        public void setServiceProvided(String serviceProvided) {
            this.serviceProvided = serviceProvided;
        }

        public LocalDateTime getCompletionDate() {
            return completionDate;
        }

        public void setCompletionDate(LocalDateTime completionDate) {
            this.completionDate = completionDate;
        }

        public List<String> getSupportingDocuments() {
            return supportingDocuments;
        }

        public void setSupportingDocuments(List<String> supportingDocuments) {
            this.supportingDocuments = supportingDocuments;
        }
    }

    public static class ServiceTimelineItem {
        private LocalDateTime date;
        private String title;
        private String detail;

        public LocalDateTime getDate() {
            return date;
        }

        public void setDate(LocalDateTime date) {
            this.date = date;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDetail() {
            return detail;
        }

        public void setDetail(String detail) {
            this.detail = detail;
        }
    }

    public static class FollowUpMonitoringSummary {
        private int numberOfFollowUpsConducted;
        private List<LocalDateTime> followUpDates;
        private String observations;
        private String outcomeEvaluation;

        public int getNumberOfFollowUpsConducted() {
            return numberOfFollowUpsConducted;
        }

        public void setNumberOfFollowUpsConducted(int numberOfFollowUpsConducted) {
            this.numberOfFollowUpsConducted = numberOfFollowUpsConducted;
        }

        public List<LocalDateTime> getFollowUpDates() {
            return followUpDates;
        }

        public void setFollowUpDates(List<LocalDateTime> followUpDates) {
            this.followUpDates = followUpDates;
        }

        public String getObservations() {
            return observations;
        }

        public void setObservations(String observations) {
            this.observations = observations;
        }

        public String getOutcomeEvaluation() {
            return outcomeEvaluation;
        }

        public void setOutcomeEvaluation(String outcomeEvaluation) {
            this.outcomeEvaluation = outcomeEvaluation;
        }
    }

    public static class OutcomeAssessment {
        private String objectiveAchieved;
        private String improvementLevel;
        private String childSafetyStatus;
        private String familyStabilityStatus;
        private String educationContinuityStatus;

        public String getObjectiveAchieved() {
            return objectiveAchieved;
        }

        public void setObjectiveAchieved(String objectiveAchieved) {
            this.objectiveAchieved = objectiveAchieved;
        }

        public String getImprovementLevel() {
            return improvementLevel;
        }

        public void setImprovementLevel(String improvementLevel) {
            this.improvementLevel = improvementLevel;
        }

        public String getChildSafetyStatus() {
            return childSafetyStatus;
        }

        public void setChildSafetyStatus(String childSafetyStatus) {
            this.childSafetyStatus = childSafetyStatus;
        }

        public String getFamilyStabilityStatus() {
            return familyStabilityStatus;
        }

        public void setFamilyStabilityStatus(String familyStabilityStatus) {
            this.familyStabilityStatus = familyStabilityStatus;
        }

        public String getEducationContinuityStatus() {
            return educationContinuityStatus;
        }

        public void setEducationContinuityStatus(String educationContinuityStatus) {
            this.educationContinuityStatus = educationContinuityStatus;
        }
    }

    public static class FinalDeclaration {
        private String statement;
        private String swSignature;
        private LocalDateTime date;
        private String swId;

        public String getStatement() {
            return statement;
        }

        public void setStatement(String statement) {
            this.statement = statement;
        }

        public String getSwSignature() {
            return swSignature;
        }

        public void setSwSignature(String swSignature) {
            this.swSignature = swSignature;
        }

        public LocalDateTime getDate() {
            return date;
        }

        public void setDate(LocalDateTime date) {
            this.date = date;
        }

        public String getSwId() {
            return swId;
        }

        public void setSwId(String swId) {
            this.swId = swId;
        }
    }
}
