package com.example.childPortal.dto;
import com.example.childPortal.model.Role; 
import java.time.LocalDateTime;
import java.util.List;

public class UserManagementDTO { 
  private String id;
  private String fullName;
  private Role role;
  private String email;
  private String phone;
  private String status;  
  private boolean active;
  private LocalDateTime lastLogin;
  private LocalDateTime registrationDate;

  private List<String> specializations; 
  private String department;
  private String rank;
  private String badgeNumber;
  private String licenseNumber; 
  private String organization; 
  
  private int activeCases;
  private int activeHelpRequests;
  private int completedCases;
  private int completedServices;

  private boolean approved;
  private String approvedBy;
  private LocalDateTime approvalDate; 
  private String deactivationReason;
  private LocalDateTime deactivationDate; 
  public UserManagementDTO() {}

  public String getId() { 
    return id; 
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
  public Role getRole() { 
    return role; 
  }
  public void setRole(Role role) { 
    this.role = role; 
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
  public String getStatus() {
    return status; 
  }
  public void setStatus(String status) {
    this.status = status; 
  }
  public boolean isActive() { 
    return active;
  }
  public void setActive(boolean active) {
    this.active = active; 
  }
  public LocalDateTime getLastLogin() {
    return lastLogin; 
  }
  public void setLastLogin(LocalDateTime lastLogin) {
    this.lastLogin = lastLogin; 
  }
  public LocalDateTime getRegistrationDate() { 
    return registrationDate;
  }
  public void setRegistrationDate(LocalDateTime registrationDate) { 
    this.registrationDate = registrationDate; 
  }
  public List<String> getSpecializations() {
    return specializations; 
  }
  public void setSpecializations(List<String> specializations) { 
    this.specializations = specializations;
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

  public String getBadgeNumber() { 
    return badgeNumber;
  }
  public void setBadgeNumber(String badgeNumber) { 
    this.badgeNumber = badgeNumber;
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
  public int getActiveCases() { 
    return activeCases; 
  }
  public void setActiveCases(int activeCases) { 
    this.activeCases = activeCases; 
  }
  public int getActiveHelpRequests() { 
    return activeHelpRequests; 
  }
  public void setActiveHelpRequests(int activeHelpRequests) { 
    this.activeHelpRequests = activeHelpRequests;
  }
  public int getCompletedCases() { 
    return completedCases; 
  }
  public void setCompletedCases(int completedCases) {
    this.completedCases = completedCases;
  }
  public int getCompletedServices() {
    return completedServices;
  }
  public void setCompletedServices(int completedServices) {
    this.completedServices = completedServices; 
  }
  public boolean isApproved() {
    return approved;
  }
  public void setApproved(boolean approved) { 
    this.approved = approved;
  }
  public String getApprovedBy() { 
    return approvedBy; 
  }
  public void setApprovedBy(String approvedBy) { 
    this.approvedBy = approvedBy;
  }
  public LocalDateTime getApprovalDate() {
    return approvalDate; 
  }
  public void setApprovalDate(LocalDateTime approvalDate) {
    this.approvalDate = approvalDate;
  }
  public String getDeactivationReason() {
    return deactivationReason; 
  }
  public void setDeactivationReason(String deactivationReason) { 
    this.deactivationReason = deactivationReason; 
  }
  public LocalDateTime getDeactivationDate() {
    return deactivationDate;
  }
  public void setDeactivationDate(LocalDateTime deactivationDate) {
    this.deactivationDate = deactivationDate;
  }
}
