package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "police_officers")
public class PoliceOfficer {
    @Id
    private String id;
    private String userId;
    private String badgeNumber;
    private String department;
    private String rank;
    private String stationAddress;
    private String idDocumentUrl;
    
    private String specialization; 
    private String jurisdictionArea; 
    private String contactRadioFrequency;
    private String vehicleNumber;
    private String partnerOfficerId; 

    private int totalCasesHandled;
    private double averageResolutionTime; 
    private int successfulTransfers;
    private int emergencyCasesHandled;

    private boolean acceptsEmergencyCalls;
    private int maxConcurrentCases = 5;
    private String preferredCaseTypes;

    public PoliceOfficer() { 
        this.totalCasesHandled = 0; 
        this.averageResolutionTime = 0; 
        this.successfulTransfers = 0; 
        this.emergencyCasesHandled = 0;
        this.acceptsEmergencyCalls = true;
    }

    public PoliceOfficer() {}

    public PoliceOfficer(String userId, String badgeNumber, String department, String rank, String stationAddress, String idDocumentUrl) {
        this.userId = userId;
        this.badgeNumber = badgeNumber;
        this.department = department;
        this.rank = rank;
        this.stationAddress = stationAddress;
        this.idDocumentUrl = idDocumentUrl;
    }

    public String getId() { 
        return id; 
    }
    public void setId(String id) { 
        this.id = id; 
    }

    public String getUserId() { 
        return userId; 
    }
    public void setUserId(String userId) {
         this.userId = userId; 
    }

    public String getBadgeNumber() { 
        return badgeNumber; 
    }
    public void setBadgeNumber(String badgeNumber) { 
        this.badgeNumber = badgeNumber; 
    }

    public String getDepartment() { 
        return department; 
    }
    public void setDepartment(String department) { 
        this.department = department; 
    }

    public String getRank() { 
        return rank; 
    }
    public void setRank(String rank) { 
        this.rank = rank; 
    }

    public String getStationAddress() { 
        return stationAddress; 
    }
    public void setStationAddress(String stationAddress) { 
        this.stationAddress = stationAddress; 
    }

    public String getIdDocumentUrl() { 
        return idDocumentUrl; 
    }
    public void setIdDocumentUrl(String idDocumentUrl) { 
        this.idDocumentUrl = idDocumentUrl; 
    }
    public String getSpecialization() { 
        return specialization;
    }
    public void setSpecialization(String specialization) { 
        this.specialization = spec ialization;
    }
    public String getJurisdictionArea() {
        return jurisdictionArea;
    }
    public void setJurisdictionArea(String jurisdictionArea) { 
        this.jurisdictionArea = jurisdictionArea; 
    }
    public String getContactRadioFrequency() { 
        return contactRadioFrequency; 
    }
    public void setContactRadioFrequency(String contactRadioFrequency) {
        this.contactRadioFrequency = contactRadioFrequency; 
    }
    public String getVehicleNumber() { 
        return vehicleNumber;
    }
    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicle Number;
    }
    public String getPartnerOfficerId() {
        return partnerOfficerId; 
    }
    public void setPartnerOfficerId(String partnerOfficerId) {
        this.partnerOfficerId = partnerOfficerId; 
    }
    public int getTotalCasesHandled() {
        return totalCasesHandled;
    }

    public void setTotalCasesHandled(int totalCasesHandled) { 
        this.totalCasesHandled = totalCasesHandled;
    }
    public double getAverageResolutionTime() { 
        return averageResolutionTime; 
    }
    public void setAverageResolutionTime(double averageResolutionTime) {
        this.averageResolutionTime = averageResolutionTime; 
    }
    public int getSuccessfulTransfers() { 
        return successfulTransfers; 
    }
    public void setSuccessfulTransfers(int successfulTransfers) {
        this.successfulTransfers = successfulTransfers; 
    }
    public int getEmergencyCasesHandled() {
        return emergencyCasesHandled;
    }
    public void setEmergencyCasesHandled(int emergencyCasesHandled) {
        this.emergencyCasesHandled = emergencyCasesHandled;
    }
    public boolean isAcceptsEmergencyCalls() { 
        return acceptsEmergencyCalls; 
    } public void setAcceptsEmergencyCalls(boolean acceptsEmergencyCalls) {
        this.acceptsEmergencyCalls = acceptsEmergencyCalls;
    }
    public int getMaxConcurrentCases() { 
        return maxConcurrentCases; 
    } 
    public void setMaxConcurrentCases(int maxConcurrentCases) {
        this.maxConcurrentCases = maxConcurrentCases;
    }
    public String getPreferredCaseTypes() {
        return preferredCaseTypes; 
    } 
    public void setPreferredCaseTypes(String preferredCaseTypes) {
        this.preferredCaseTypes = preferredCaseTypes;
    }

    public boolean canHandleCaseType(CaseType caseType) {
        if (preferredCaseTypes == null || preferredCaseTypes.isEmpty()) {
            return true; 
        }
        String[] preferredTypes = preferredCaseTypes.split(","); 
        for (String type : preferredTypes) {
            if (type.trim().equalsIgnoreCase(caseType.name())) {
                return true;
            }
        }
        return false;
    }
    public double getWorkloadPercentage() {
        User user = getUser(); 
        if (user != null) {
            return (double) user.getCurrentCaseCount() / maxConcurrentCases * 100;
        }
        return 0; 
    }
}


