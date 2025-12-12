package com.example.childPortal.model;

//import com.example.childPortal.model.Role; 
import java.util.List;
public class UserUpdateRequest {  
  private String fullName;
  private String email;
  private String phone;
  private Role role;
  private boolean active; 
  private String status;
  private String badgeNumber;
  private String department;
  private String rank;
  private String stationAddress;
  private String licenseNumber; 
  private List<String> specializations; 
  private String organization;
  private String yearsOfExperience;
  
  public UserUpdateRequest() {}

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
  public String getStatus() { 
    return status; 
  }
  public void setStatus(String status) {
    this.status = status; 
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
  public String getLicenseNumber() {
    return licenseNumber;
  }
  public void setLicenseNumber(String licenseNumber) {
    this.licenseNumber = licenseNumber;
  }
  public List<String> getSpecializations() { 
    return specializations; 
  }
  public void setSpecializations(List<String> specializations) {
    this.specializations = specializations;
  }
  public String getOrganization() { 
    return organization; 
  }
  public void setOrganization(String organization) {
    this.organization = organization; 
  }
  public String getYearsOfExperience() { 
    return yearsOfExperience;
  }
  public void setYearsOfExperience(String yearsOfExperience) { 
    this.yearsOfExperience = yearsOfExperience;
  }
}
