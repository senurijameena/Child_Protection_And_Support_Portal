package com.example.childPortal.dto;

import com.example.childPortal.model.Role;
import com.example.childPortal.model.AvailabilityStatus;
import java.time.LocalDateTime;

public class UserSearchFilterDTO {
    private String keyword;
    private Role role;
    private Boolean active;
    private Boolean approved;
    private AvailabilityStatus availabilityStatus;
    private String email;
    private String phone;
    private LocalDateTime registrationDateFrom;
    private LocalDateTime registrationDateTo;
    private LocalDateTime lastLoginFrom;
    private LocalDateTime lastLoginTo;

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
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

    public LocalDateTime getRegistrationDateFrom() {
        return registrationDateFrom;
    }

    public void setRegistrationDateFrom(LocalDateTime registrationDateFrom) {
        this.registrationDateFrom = registrationDateFrom;
    }

    public LocalDateTime getRegistrationDateTo() {
        return registrationDateTo;
    }

    public void setRegistrationDateTo(LocalDateTime registrationDateTo) {
        this.registrationDateTo = registrationDateTo;
    }

    public LocalDateTime getLastLoginFrom() {
        return lastLoginFrom;
    }

    public void setLastLoginFrom(LocalDateTime lastLoginFrom) {
        this.lastLoginFrom = lastLoginFrom;
    }

    public LocalDateTime getLastLoginTo() {
        return lastLoginTo;
    }

    public void setLastLoginTo(LocalDateTime lastLoginTo) {
        this.lastLoginTo = lastLoginTo;
    }

    public boolean hasFilters() {
        return keyword != null || role != null || active != null || approved != null ||
               availabilityStatus != null || email != null || phone != null ||
               registrationDateFrom != null || registrationDateTo != null ||
               lastLoginFrom != null || lastLoginTo != null;
    }
}

