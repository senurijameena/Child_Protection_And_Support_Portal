package com.example.childPortal.dto;

import java.time.LocalDateTime;

public class DuplicateDetectionDTO {
    private String id;
    private String trackingId;
    private String type; 
    private String title;
    private String description;
    private String location;
    private String approximateAge;
    private String gender;
    private String identificationMarks;
    private LocalDateTime date;
    private String status;
    private String reporterName;
    private String requesterName;
    private double similarityScore;
    private String similarityReason; 
    
    public DuplicateDetectionDTO() {}

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
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
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
    
    public LocalDateTime getDate() {
        return date;
    }
    
    public void setDate(LocalDateTime date) {
        this.date = date;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getReporterName() {
        return reporterName;
    }
    
    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }
    
    public String getRequesterName() {
        return requesterName;
    }
    
    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }
    
    public double getSimilarityScore() {
        return similarityScore;
    }
    
    public void setSimilarityScore(double similarityScore) {
        this.similarityScore = similarityScore;
    }
    
    public String getSimilarityReason() {
        return similarityReason;
    }
    
    public void setSimilarityReason(String similarityReason) {
        this.similarityReason = similarityReason;
    }
}

