package com.example.childPortal.dto;

import com.example.childPortal.model.Role;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private Role role;
    private String officialIdFile;
    private boolean termsAccepted;
    
    // Role-specific fields
    private String badgeNumber;
    private String department; // Add this field
    private String rank; // Add this field
    private String stationAddress; // Add this field
    private String licenseNumber;
    private String organization; // Add this field
    
    // Getters and setters for ALL fields
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    public String getOfficialIdFile() { return officialIdFile; }
    public void setOfficialIdFile(String officialIdFile) { this.officialIdFile = officialIdFile; }
    
    public boolean isTermsAccepted() { return termsAccepted; }
    public void setTermsAccepted(boolean termsAccepted) { this.termsAccepted = termsAccepted; }
    
    public String getBadgeNumber() { return badgeNumber; }
    public void setBadgeNumber(String badgeNumber) { this.badgeNumber = badgeNumber; }
    
    // ADD THESE GETTERS AND SETTERS:
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getRank() { return rank; }
    public void setRank(String rank) { this.rank = rank; }
    
    public String getStationAddress() { return stationAddress; }
    public void setStationAddress(String stationAddress) { this.stationAddress = stationAddress; }
    
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
}