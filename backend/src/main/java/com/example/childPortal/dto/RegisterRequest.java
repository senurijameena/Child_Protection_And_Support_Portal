package com.example.childPortal.dto;

import com.example.childPortal.model.Role;

public class RegisterRequest {
     private String fullName;
     private String email;
     private String phone;
     private String address;
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

     // Police Station registration
     private String stationName;
     private String district;
     private String city;
     private String officerInChargeName;
     private String locationCoordinates; // "latitude,longitude"
     private String officerIdProofUrl;
     private String governmentApprovalLetterUrl;
     private String allocatedResources;
     private String staffDetails;

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

     public String getAddress() {
          return address;
     }

     public void setAddress(String address) {
          this.address = address;
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

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getOfficerInChargeName() {
        return officerInChargeName;
    }

    public void setOfficerInChargeName(String officerInChargeName) {
        this.officerInChargeName = officerInChargeName;
    }

    public String getLocationCoordinates() {
        return locationCoordinates;
    }

    public void setLocationCoordinates(String locationCoordinates) {
        this.locationCoordinates = locationCoordinates;
    }

    public String getOfficerIdProofUrl() {
        return officerIdProofUrl;
    }

    public void setOfficerIdProofUrl(String officerIdProofUrl) {
        this.officerIdProofUrl = officerIdProofUrl;
    }

    public String getGovernmentApprovalLetterUrl() {
        return governmentApprovalLetterUrl;
    }

    public void setGovernmentApprovalLetterUrl(String governmentApprovalLetterUrl) {
        this.governmentApprovalLetterUrl = governmentApprovalLetterUrl;
    }

    public String getAllocatedResources() {
        return allocatedResources;
    }

    public void setAllocatedResources(String allocatedResources) {
        this.allocatedResources = allocatedResources;
    }

    public String getStaffDetails() {
        return staffDetails;
    }

    public void setStaffDetails(String staffDetails) {
        this.staffDetails = staffDetails;
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