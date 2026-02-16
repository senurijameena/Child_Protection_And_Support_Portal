package com.example.childPortal.dto;

import com.example.childPortal.model.Role;
import java.time.LocalDateTime;

public class UserDTO {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String profilePhoto;
    private Role role;
    private boolean active;
    private boolean approved;
    private LocalDateTime registrationDate;
    private LocalDateTime lastLogin;

    // Additional fields for Social Worker / Police
    private String address;
    private String licenseNumber;
    private String organization;
    private java.util.List<String> specializations;
    private String yearsOfExperience;
    private String certificationDocumentUrl;

    // Getters and Setters
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public java.util.List<String> getSpecializations() {
        return specializations;
    }

    public void setSpecializations(java.util.List<String> specializations) {
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

    public void setId(String id) {
        this.id = id;
    }

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

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }
}
