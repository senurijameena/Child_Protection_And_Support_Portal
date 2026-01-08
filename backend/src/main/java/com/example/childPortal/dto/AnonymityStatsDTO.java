package com.example.childPortal.dto;

import java.util.Map;

public class AnonymityStatsDTO {
    private long totalSubmissions;
    private long anonymousSubmissions;
    private long registeredSubmissions;
    private double anonymousPercentage;
    private double registeredPercentage;
    private long anonymousCases;
    private long anonymousHelpRequests;
    private double averageResponseTimeAnonymous;
    private double averageResponseTimeRegistered;
    private double resolutionRateAnonymous;
    private double resolutionRateRegistered;
    private int securityScore;
    private Map<String, Long> submissionsByType;

    public long getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(long totalSubmissions) { this.totalSubmissions = totalSubmissions; }
    
    public long getAnonymousSubmissions() { return anonymousSubmissions; }
    public void setAnonymousSubmissions(long anonymousSubmissions) { this.anonymousSubmissions = anonymousSubmissions; }
    
    public long getRegisteredSubmissions() { return registeredSubmissions; }
    public void setRegisteredSubmissions(long registeredSubmissions) { this.registeredSubmissions = registeredSubmissions; }
    
    public double getAnonymousPercentage() { return anonymousPercentage; }
    public void setAnonymousPercentage(double anonymousPercentage) { this.anonymousPercentage = anonymousPercentage; }
    
    public double getRegisteredPercentage() { return registeredPercentage; }
    public void setRegisteredPercentage(double registeredPercentage) { this.registeredPercentage = registeredPercentage; }
    
    public long getAnonymousCases() { return anonymousCases; }
    public void setAnonymousCases(long anonymousCases) { this.anonymousCases = anonymousCases; }
    
    public long getAnonymousHelpRequests() { return anonymousHelpRequests; }
    public void setAnonymousHelpRequests(long anonymousHelpRequests) { this.anonymousHelpRequests = anonymousHelpRequests; }
    
    public double getAverageResponseTimeAnonymous() { return averageResponseTimeAnonymous; }
    public void setAverageResponseTimeAnonymous(double averageResponseTimeAnonymous) { this.averageResponseTimeAnonymous = averageResponseTimeAnonymous; }
    
    public double getAverageResponseTimeRegistered() { return averageResponseTimeRegistered; }
    public void setAverageResponseTimeRegistered(double averageResponseTimeRegistered) { this.averageResponseTimeRegistered = averageResponseTimeRegistered; }
    
    public double getResolutionRateAnonymous() { return resolutionRateAnonymous; }
    public void setResolutionRateAnonymous(double resolutionRateAnonymous) { this.resolutionRateAnonymous = resolutionRateAnonymous; }
    
    public double getResolutionRateRegistered() { return resolutionRateRegistered; }
    public void setResolutionRateRegistered(double resolutionRateRegistered) { this.resolutionRateRegistered = resolutionRateRegistered; }
    
    public int getSecurityScore() { return securityScore; }
    public void setSecurityScore(int securityScore) { this.securityScore = securityScore; }
    
    public Map<String, Long> getSubmissionsByType() { return submissionsByType; }
    public void setSubmissionsByType(Map<String, Long> submissionsByType) { this.submissionsByType = submissionsByType; }
}

