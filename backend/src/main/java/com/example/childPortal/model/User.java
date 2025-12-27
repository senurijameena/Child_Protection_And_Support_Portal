package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private Role role;
    private boolean active;
    private boolean approved;
    private String officialIdFile;
    private LocalDateTime registrationDate;
    private LocalDateTime lastLogin;

    private AvailabilityStatus availabilityStatus;
    private LocalDateTime statusChangedAt;
    private String statusNote;

    private int currentCaseCount; /
    private int currentHelpRequestCount; 
    private int maxCapacity;
    
    private WorkSchedule workSchedule;

    public User() {
        this.registrationDate = LocalDateTime.now();
        this.active = true;
        this.availabilityStatus = AvailabilityStatus.AVAILABLE; 
        this.statusChangedAt = LocalDateTime.now(); 
        this.currentCaseCount = 0;
        this.currentHelpRequestCount = 0;
        this.maxCapacity = 10; 
    }

    // Getters and setters
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
    public String getOfficialIdFile() {
        return officialIdFile; 
    }
    public void setOfficialIdFile(String officialIdFile) {
        this.officialIdFile = officialIdFile; 
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
    public AvailabilityStatus getAvailabilityStatus() { 
        return availabilityStatus; 
    } 
    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
        this.statusChangedAt = LocalDateTime.now(); 
    }
    public LocalDateTime getStatusChangedAt() { 
        return statusChangedAt;
    }
    public void setStatusChangedAt(LocalDateTime statusChangedAt) {
        this.statusChange dAt = statusChangedAt;
    }
    public String getStatusNote() { 
        return statusNote;
    }
    public void setStatusNote(String statusNote) { 
        this.statusNote = statusNote; 
    }
    public int getCurrentCaseCount() { 
        return currentCaseCount; 
    }
    public void setCurrentCaseCount(int currentCaseCount) {
        this.currentCaseCount = c urrentCaseCount; 
    }
    public int getCurrentHelpRequestCount() { 
        return currentHelpRequestCount;
    } 
    public void setCurrentHelpRequestCount(int currentHelpRequestCount) {
        this.currentHelpRequestCount = currentHelpRequestCount; 
    }
    public int getMaxCapacity() { 
        return maxCapacity; 
    }
    public void setMaxCapacity(int maxCapacity) { 
        this.maxCapacity = maxCapacity; 
    }
    public WorkSchedule getWorkSchedule() {
        return workSchedule;
    }
    public void setWorkSchedule(WorkSchedule workSchedule) {
        this.workSchedule = work Schedule;
    }
    
    public boolean canTakeMoreAssignments() {
        if (availabilityStatus == AvailabilityStatus.OFF_DUTY) {
            return false;
        }
        if (availabilityStatus == AvailabilityStatus.EMERGENCY_ONLY) {
            return false; 
        }
        if (role == Role.PO) {
            return currentCaseCount < maxCapacity;
        } else if (role == Role.SW) {
            return currentHelpRequestCount < maxCapacity;
        }
        return true;
    }
    
    public boolean isAvailableForEmergency() {
        return availabilityStatus != AvailabilityStatus.OFF_DUTY; 
    }
    public void incrementAssignmentCount() {
    if (role == Role.PO) {
        currentCaseCount++;
    } else if (role == Role.SW) {
        currentHelpRequestCount++;
    }
}
    public void decrementAssignmentCount() {

        if (role == Role.PO) {
            currentCaseCount = Math.max(0, currentCaseCount - 1);
        } else if (role == Role.SW) {
            currentHelpRequestCount = Math.max(0, currentHelpRequestCount - 1);
        }
    }
}







    
}
