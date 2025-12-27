package com.example.childPortal.dto;

public class PoliceOfficerDTO {
    private String userId;
    private String badgeNumber;
    private String department;
    private String rank;
    private String stationAddress;

    // Getters and setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getBadgeNumber() { return badgeNumber; }
    public void setBadgeNumber(String badgeNumber) { this.badgeNumber = badgeNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getRank() { return rank; }
    public void setRank(String rank) { this.rank = rank; }
    public String getStationAddress() { return stationAddress; }
    public void setStationAddress(String stationAddress) { this.stationAddress = stationAddress; }
}
