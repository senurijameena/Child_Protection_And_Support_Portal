package com.example.childPortal.dto;

import java.time.LocalDateTime;
import java.util.List;

public class HelpRequestCollaboratorDTO {
    private String collaborationId;
    private String userId;
    private String name;
    private String email;
    private String profilePhoto;
    private String permission;
    private String status;
    private String reason;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private String district;
    private String specialization;
    private String availability;
    
    // Additional fields for pending collaboration requests (populated by getMyPendingRequests)
    private String helpRequestId;
    private String requestTrackingId;
    private String requestCategory;
    private String ownerUserId;
    private String ownerName;
    private String ownerProfilePhoto;
    
    // Privacy-safe preview data
    private String problemSummary;
    private String currentProgress;
    private List<String> servicesApplied;

    public String getCollaborationId() {
        return collaborationId;
    }

    public void setCollaborationId(String collaborationId) {
        this.collaborationId = collaborationId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public String getPermission() {
        return permission;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getHelpRequestId() {
        return helpRequestId;
    }

    public void setHelpRequestId(String helpRequestId) {
        this.helpRequestId = helpRequestId;
    }

    public String getRequestTrackingId() {
        return requestTrackingId;
    }

    public void setRequestTrackingId(String requestTrackingId) {
        this.requestTrackingId = requestTrackingId;
    }

    public String getRequestCategory() {
        return requestCategory;
    }

    public void setRequestCategory(String requestCategory) {
        this.requestCategory = requestCategory;
    }

    public String getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(String ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerProfilePhoto() {
        return ownerProfilePhoto;
    }

    public void setOwnerProfilePhoto(String ownerProfilePhoto) {
        this.ownerProfilePhoto = ownerProfilePhoto;
    }

    public String getProblemSummary() {
        return problemSummary;
    }

    public void setProblemSummary(String problemSummary) {
        this.problemSummary = problemSummary;
    }

    public String getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(String currentProgress) {
        this.currentProgress = currentProgress;
    }

    public List<String> getServicesApplied() {
        return servicesApplied;
    }

    public void setServicesApplied(List<String> servicesApplied) {
        this.servicesApplied = servicesApplied;
    }
}
