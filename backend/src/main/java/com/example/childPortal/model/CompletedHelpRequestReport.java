package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "completed_help_request_reports")
public class CompletedHelpRequestReport {
    @Id
    private String id;
    private String reportId;
    private String helpRequestId;

    private String generatedByUserId;
    private String generatedByName;
    private String generatedByDisplayId;
    private LocalDateTime generatedAt;

    private WorkflowStatus workflowStatus;
    private LocalDateTime sentToAdminAt;

    private String aiGeneratedSummary;
    private String initialAssessmentSummary;
    private String adjustments;
    private String followUpObservations;

    private String objectiveAchieved; // Yes / Partial / No
    private String improvementLevel; // High / Medium / Low
    private String childSafetyStatus;
    private String familyStabilityStatus;
    private String educationContinuityStatus;

    private List<String> challenges;
    private List<String> recommendations;
    private List<String> attachments;

    private String finalDeclarationText;
    private LocalDateTime declarationSignedAt;
    private String declarationSignedById;

    private String adminReviewNote;
    private String reviewedByUserId;
    private String reviewedByName;
    private LocalDateTime reviewedAt;

    public enum WorkflowStatus {
        DRAFT,
        SENT_TO_ADMIN,
        APPROVED,
        CLARIFICATION_REQUESTED,
        REOPEN_REQUESTED
    }

    public CompletedHelpRequestReport() {
        this.generatedAt = LocalDateTime.now();
        this.workflowStatus = WorkflowStatus.DRAFT;
        this.challenges = new ArrayList<>();
        this.recommendations = new ArrayList<>();
        this.attachments = new ArrayList<>();
        this.finalDeclarationText =
                "I confirm that the above case has been completed in accordance with the Child Protection and Support Portal guidelines.";
        this.objectiveAchieved = "Partial";
        this.improvementLevel = "Medium";
        this.childSafetyStatus = "Stable";
        this.familyStabilityStatus = "Improving";
        this.educationContinuityStatus = "Not Applicable";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public String getHelpRequestId() {
        return helpRequestId;
    }

    public void setHelpRequestId(String helpRequestId) {
        this.helpRequestId = helpRequestId;
    }

    public String getGeneratedByUserId() {
        return generatedByUserId;
    }

    public void setGeneratedByUserId(String generatedByUserId) {
        this.generatedByUserId = generatedByUserId;
    }

    public String getGeneratedByName() {
        return generatedByName;
    }

    public void setGeneratedByName(String generatedByName) {
        this.generatedByName = generatedByName;
    }

    public String getGeneratedByDisplayId() {
        return generatedByDisplayId;
    }

    public void setGeneratedByDisplayId(String generatedByDisplayId) {
        this.generatedByDisplayId = generatedByDisplayId;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public WorkflowStatus getWorkflowStatus() {
        return workflowStatus;
    }

    public void setWorkflowStatus(WorkflowStatus workflowStatus) {
        this.workflowStatus = workflowStatus;
    }

    public LocalDateTime getSentToAdminAt() {
        return sentToAdminAt;
    }

    public void setSentToAdminAt(LocalDateTime sentToAdminAt) {
        this.sentToAdminAt = sentToAdminAt;
    }

    public String getAiGeneratedSummary() {
        return aiGeneratedSummary;
    }

    public void setAiGeneratedSummary(String aiGeneratedSummary) {
        this.aiGeneratedSummary = aiGeneratedSummary;
    }

    public String getInitialAssessmentSummary() {
        return initialAssessmentSummary;
    }

    public void setInitialAssessmentSummary(String initialAssessmentSummary) {
        this.initialAssessmentSummary = initialAssessmentSummary;
    }

    public String getAdjustments() {
        return adjustments;
    }

    public void setAdjustments(String adjustments) {
        this.adjustments = adjustments;
    }

    public String getFollowUpObservations() {
        return followUpObservations;
    }

    public void setFollowUpObservations(String followUpObservations) {
        this.followUpObservations = followUpObservations;
    }

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

    public List<String> getChallenges() {
        return challenges;
    }

    public void setChallenges(List<String> challenges) {
        this.challenges = challenges;
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

    public String getFinalDeclarationText() {
        return finalDeclarationText;
    }

    public void setFinalDeclarationText(String finalDeclarationText) {
        this.finalDeclarationText = finalDeclarationText;
    }

    public LocalDateTime getDeclarationSignedAt() {
        return declarationSignedAt;
    }

    public void setDeclarationSignedAt(LocalDateTime declarationSignedAt) {
        this.declarationSignedAt = declarationSignedAt;
    }

    public String getDeclarationSignedById() {
        return declarationSignedById;
    }

    public void setDeclarationSignedById(String declarationSignedById) {
        this.declarationSignedById = declarationSignedById;
    }

    public String getAdminReviewNote() {
        return adminReviewNote;
    }

    public void setAdminReviewNote(String adminReviewNote) {
        this.adminReviewNote = adminReviewNote;
    }

    public String getReviewedByUserId() {
        return reviewedByUserId;
    }

    public void setReviewedByUserId(String reviewedByUserId) {
        this.reviewedByUserId = reviewedByUserId;
    }

    public String getReviewedByName() {
        return reviewedByName;
    }

    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}
