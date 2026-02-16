package com.example.childPortal.dto;

import java.util.List;

public class CompletedHelpReportDraftRequestDTO {
    private String initialAssessmentSummary;
    private String adjustments;
    private String followUpObservations;
    private String objectiveAchieved;
    private String improvementLevel;
    private String childSafetyStatus;
    private String familyStabilityStatus;
    private String educationContinuityStatus;
    private List<String> challenges;
    private List<String> recommendations;
    private List<String> attachments;
    private String finalDeclarationText;

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
}
