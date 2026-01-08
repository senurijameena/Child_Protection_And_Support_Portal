package com.example.childPortal.dto;

import com.example.childPortal.model.Role;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String confirmPassword; 
    private Role role;
    private String profilePhoto;
    private boolean termsAccepted;

    private String badgeNumber;
    private String department;
    private String rank;
    private String stationAddress;
    private String idDocumentUrl; 

    private String licenseNumber;
    private String organization;
    private String specializations; 
    private String yearsOfExperience;
    private String certificationDocumentUrl; 

    public String getFullName() { 
        return fullName; 
    }
    public void setFullName(String fullName) {
         this.fullName = fullName;
    }
    
    public String getEmail() {
         return email; 
    }
    public void setEmail(String email) { 
        this.email = email; 
    }
    
    public String getPhone() {
         return phone;
 }
    public void setPhone(String phone) {
         this.phone = phone; 
    }
    
    public String getPassword() { 
        return password; 
    }
    public void setPassword(String password) {
         this.password = password; 
    }
    
    public String getConfirmPassword() {
         return confirmPassword; 
        }
    public void setConfirmPassword(String confirmPassword) {
         this.confirmPassword = confirmPassword; 
    }
    
    public Role getRole() {
         return role; 
    }
    public void setRole(Role role) { 
        this.role = role; 
    }
    
    public String getProfilePhoto() { 
        return profilePhoto; 
    }
    public void setProfilePhoto(String profilePhoto) { 
        this.profilePhoto = profilePhoto; 
    }
    
    public boolean isTermsAccepted() { 
        return termsAccepted;
     }
    public void setTermsAccepted(boolean termsAccepted) {
         this.termsAccepted = termsAccepted; 
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

    public String getLicenseNumber() {
         return licenseNumber; 
     }
    public void setLicenseNumber(String licenseNumber) {
         this.licenseNumber = licenseNumber; 
    }
    
    public String getOrganization() {
         return organization; 
    }
    public void setOrganization(String organization) { 
        this.organization = organization; 
    }
    
    public String getSpecializations() {
         return specializations;
     }
    public void setSpecializations(String specializations) {
         this.specializations = specializations; 
    }
    
    public String getYearsOfExperience() {
         return yearsOfExperience;
     }
    public void setYearsOfExperience(String yearsOfExperience) {
         this.yearsOfExperience = yearsOfExperience; 
    }
    
    public String getCertificationDocumentUrl() { 
        return certificationDocumentUrl; 
    }
    public void setCertificationDocumentUrl(String certificationDocumentUrl) {
         this.certificationDocumentUrl = certificationDocumentUrl;
     }
}