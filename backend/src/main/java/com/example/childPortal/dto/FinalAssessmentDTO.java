package com.example.childPortal.dto;

import java.util.List;

public class FinalAssessmentDTO {
    private String id;
    private String helpRequestId;
    
    // Assessment questions
    private boolean objectiveAchieved;
    private String objectiveAchievedDetails;
    
    private boolean childSafe;
    private String childSafetyDetails;
    private String childSafetyRating; // SAFE, AT_RISK, REQUIRES_MONITORING
    
    private boolean needsContinuedMonitoring;
    private String monitoringPlan;
    private int monitoringDurationMonths;
    
    private boolean recommendClosure;
    private String closureRecommendationReason;
    
    // Assessment scores (1-5 scale)
    private Integer overallProgressScore;
    private Integer familySupportScore;
    private Integer childWellbeingScore;
    private Integer serviceEffectivenessScore;
    
    // Additional assessment fields
    private String overallSummary;
    private List<String> achievedOutcomes;
    private List<String> remainingConcerns;
    private List<String> recommendedNextSteps;
    private List<String> lessonsLearned;
    
    // Supporting documents
    private List<String> attachmentUrls;
    
    // Sign-off
    private boolean signedOff;
    private String digitalSignature;
    
    public FinalAssessmentDTO() {}
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getHelpRequestId() { return helpRequestId; }
    public void setHelpRequestId(String helpRequestId) { this.helpRequestId = helpRequestId; }
    
    public boolean isObjectiveAchieved() { return objectiveAchieved; }
    public void setObjectiveAchieved(boolean objectiveAchieved) { this.objectiveAchieved = objectiveAchieved; }
    
    public String getObjectiveAchievedDetails() { return objectiveAchievedDetails; }
    public void setObjectiveAchievedDetails(String objectiveAchievedDetails) { this.objectiveAchievedDetails = objectiveAchievedDetails; }
    
    public boolean isChildSafe() { return childSafe; }
    public void setChildSafe(boolean childSafe) { this.childSafe = childSafe; }
    
    public String getChildSafetyDetails() { return childSafetyDetails; }
    public void setChildSafetyDetails(String childSafetyDetails) { this.childSafetyDetails = childSafetyDetails; }
    
    public String getChildSafetyRating() { return childSafetyRating; }
    public void setChildSafetyRating(String childSafetyRating) { this.childSafetyRating = childSafetyRating; }
    
    public boolean isNeedsContinuedMonitoring() { return needsContinuedMonitoring; }
    public void setNeedsContinuedMonitoring(boolean needsContinuedMonitoring) { this.needsContinuedMonitoring = needsContinuedMonitoring; }
    
    public String getMonitoringPlan() { return monitoringPlan; }
    public void setMonitoringPlan(String monitoringPlan) { this.monitoringPlan = monitoringPlan; }
    
    public int getMonitoringDurationMonths() { return monitoringDurationMonths; }
    public void setMonitoringDurationMonths(int monitoringDurationMonths) { this.monitoringDurationMonths = monitoringDurationMonths; }
    
    public boolean isRecommendClosure() { return recommendClosure; }
    public void setRecommendClosure(boolean recommendClosure) { this.recommendClosure = recommendClosure; }
    
    public String getClosureRecommendationReason() { return closureRecommendationReason; }
    public void setClosureRecommendationReason(String closureRecommendationReason) { this.closureRecommendationReason = closureRecommendationReason; }
    
    public Integer getOverallProgressScore() { return overallProgressScore; }
    public void setOverallProgressScore(Integer overallProgressScore) { this.overallProgressScore = overallProgressScore; }
    
    public Integer getFamilySupportScore() { return familySupportScore; }
    public void setFamilySupportScore(Integer familySupportScore) { this.familySupportScore = familySupportScore; }
    
    public Integer getChildWellbeingScore() { return childWellbeingScore; }
    public void setChildWellbeingScore(Integer childWellbeingScore) { this.childWellbeingScore = childWellbeingScore; }
    
    public Integer getServiceEffectivenessScore() { return serviceEffectivenessScore; }
    public void setServiceEffectivenessScore(Integer serviceEffectivenessScore) { this.serviceEffectivenessScore = serviceEffectivenessScore; }
    
    public String getOverallSummary() { return overallSummary; }
    public void setOverallSummary(String overallSummary) { this.overallSummary = overallSummary; }
    
    public List<String> getAchievedOutcomes() { return achievedOutcomes; }
    public void setAchievedOutcomes(List<String> achievedOutcomes) { this.achievedOutcomes = achievedOutcomes; }
    
    public List<String> getRemainingConcerns() { return remainingConcerns; }
    public void setRemainingConcerns(List<String> remainingConcerns) { this.remainingConcerns = remainingConcerns; }
    
    public List<String> getRecommendedNextSteps() { return recommendedNextSteps; }
    public void setRecommendedNextSteps(List<String> recommendedNextSteps) { this.recommendedNextSteps = recommendedNextSteps; }
    
    public List<String> getLessonsLearned() { return lessonsLearned; }
    public void setLessonsLearned(List<String> lessonsLearned) { this.lessonsLearned = lessonsLearned; }
    
    public List<String> getAttachmentUrls() { return attachmentUrls; }
    public void setAttachmentUrls(List<String> attachmentUrls) { this.attachmentUrls = attachmentUrls; }
    
    public boolean isSignedOff() { return signedOff; }
    public void setSignedOff(boolean signedOff) { this.signedOff = signedOff; }
    
    public String getDigitalSignature() { return digitalSignature; }
    public void setDigitalSignature(String digitalSignature) { this.digitalSignature = digitalSignature; }
}
