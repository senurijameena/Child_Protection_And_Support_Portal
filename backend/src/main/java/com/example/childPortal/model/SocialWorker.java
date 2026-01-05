package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "social_workers")
public class SocialWorker {
    @Id
    private String id;
    private String userId;
    private String licenseNumber;
    private List<String> specializations;
    private String organization;
    private int yearsOfExperience;
    private String idDocumentUrl;
    private boolean available;

    private List<String> languages; 
    private String serviceArea; 
    private String qualificationLevel; 
    private String contactHours; 
    private String emergencyContact;

    private boolean providesHomeVisits;
    private boolean providesOnlineCounseling;
    private boolean providesGroupSessions;
    private boolean hasTransportation;

    private int totalServicesProvided;
    private double clientSatisfactionScore; 
    private int successfulServiceCompletions;
    private int emergencyServicesProvided;

    private int maxConcurrentServices = 8; 
    private int currentServiceCount = 0;

    private List<String> preferredServiceTypes; 
    private String workingDays; 
    private boolean availableOnCall;
    

    public SocialWorker() {
        this.available = true;
        this.totalServicesProvided = 0; 
        this.clientSatisfactionScore = 0; 
        this.successfulServiceCompletions = 0;
        this.emergencyServicesProvided = 0; 
        this.availableOnCall = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public List<String> getSpecializations() { return specializations; }
    public void setSpecializations(List<String> specializations) { this.specializations = specializations; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public int getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(int yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public String getIdDocumentUrl() { return idDocumentUrl; }
    public void setIdDocumentUrl(String idDocumentUrl) { this.idDocumentUrl = idDocumentUrl; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }
    public String getServiceArea() { return serviceArea; }
    public void setServiceArea(String serviceArea) { this.serviceArea = serviceArea; }
    public String getQualificationLevel() { return qualificationLevel; }
    public void setQualificationLevel(String qualificationLevel) {this.qualificationLevel = qualificationLevel; }
    public String getContactHours() { return contactHours; }
    public void setContactHours(String contactHours) { this.contactHours = contactHours; }
    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
    public boolean isProvidesHomeVisits() { return providesHomeVisits; } 
    public void setProvidesHomeVisits(boolean providesHomeVisits) {this.providesHomeVisits = providesHomeVisits; }
    public boolean isProvidesOnlineCounseling() { return providesOnlineCounseling; } 
    public void setProvidesOnlineCounseling(boolean providesOnlineCounseling) {this.providesOnlineCounseling = providesOnlineCounseling; }
    public boolean isProvidesGroupSessions() { return providesGroupSessions; } 
    public void setProvidesGroupSessions(boolean providesGroupSessions) {this.providesGroupSessions = providesGroupSessions; }
    public boolean isHasTransportation() { return hasTransportation; } 
    public void setHasTransportation(boolean hasTransportation) {this.hasTransportation = hasTransportation;}
    public int getTotalServicesProvided() { return totalServicesProvided; } 
    public void setTotalServicesProvided(int totalServicesProvided) {this.totalServicesProvided = totalServicesProvided; }
    public double getClientSatisfactionScore() { return clientSatisfactionScore; } 
    public void setClientSatisfactionScore(double clientSatisfactionScore) {this.clientSatisfactionScore = clientSatisfactionScore; }
    public int getSuccessfulServiceCompletions() { return successfulServiceCompletions; }
    public void setSuccessfulServiceCompletions(int successfulServiceCompletions) { this.successfulServiceCompletions = successfulServiceCompletions;}
    public int getEmergencyServicesProvided() { return emergencyServicesProvided; } 
    public void setEmergencyServicesProvided(int emergencyServicesProvided) {this.emergencyServicesProvided = emergencyServicesProvided; }
    public int getMaxConcurrentServices() { return maxConcurrentServices; }
    public void setMaxConcurrentServices(int maxConcurrentServices) {this.maxConcurrentServices = maxConcurrentServices; }
    public int getCurrentServiceCount() { return currentServiceCount; }
    public void setCurrentServiceCount(int currentServiceCount) {this.currentServiceCount = currentServiceCount; }
    public List<String> getPreferredServiceTypes() { return preferredServiceTypes; } 
    public void setPreferredServiceTypes(List<String> preferredServiceTypes) {this.preferredServiceTypes = preferredServiceTypes; }
    public String getWorkingDays() { return workingDays; }
    public void setWorkingDays(String workingDays) { this.workingDays = workingDays; }
    public boolean isAvailableOnCall() { return availableOnCall; }
    public void setAvailableOnCall(boolean availableOnCall) { this.availableOnCall = availableOnCall; }
    public boolean canHandleHelpType(HelpType helpType) {
        if (preferredServiceTypes == null || preferredServiceTypes.isEmpty()) {
            return true; 
        }
        return preferredServiceTypes.contains(helpType.name()); 
    }
    public boolean speaksLanguage(String language) {
        return languages != null && languages.contains(language);
    }
    public double getWorkloadPercentage() {
        return (double) currentServiceCount / maxConcurrentServices * 100;
    }
    public boolean canTakeMoreServices() {
        return currentServiceCount < maxConcurrentServices && available;
    } 
}



























