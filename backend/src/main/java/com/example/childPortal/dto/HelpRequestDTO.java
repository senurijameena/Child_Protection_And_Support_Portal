package com.example.childPortal.dto;

import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.model.Priority;
import com.example.childPortal.dto.ServicePackageDTO;
import com.example.childPortal.dto.ServiceItemExecutionDTO;
import java.time.LocalDateTime;
import java.util.List;

public class HelpRequestDTO {
    private String id;
    private String trackingId;
    private String requesterUserId;
    private boolean anonymous;
    private String requesterName;
    private String approximateAge;
    private String gender;
    private String identificationMarks;
    private HelpType helpType;
    private String description;
    private String location;
    private List<String> documentUrls;
    private RequestStatus status;
    private String assignedWorkerId;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime requestDate;
    private Priority priority;

    // Applied service package (when a social worker has proposed one)
    private ServicePackageDTO appliedPackage;
    // Public user acceptance status of the applied package (PENDING / ACCEPTED / REJECTED / etc.)
    private String appliedPackageStatus;
    // When the service package was applied to this request
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime appliedPackageAppliedAt;
    // Per-service execution status (populated when PU accepts)
    private List<ServiceItemExecutionDTO> appliedPackageItemExecutions;

    public HelpRequestDTO() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTrackingId() {
        return trackingId;
    }

    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public String getRequesterUserId() {
        return requesterUserId;
    }

    public void setRequesterUserId(String requesterUserId) {
        this.requesterUserId = requesterUserId;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getApproximateAge() {
        return approximateAge;
    }

    public void setApproximateAge(String approximateAge) {
        this.approximateAge = approximateAge;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getIdentificationMarks() {
        return identificationMarks;
    }

    public void setIdentificationMarks(String identificationMarks) {
        this.identificationMarks = identificationMarks;
    }

    public HelpType getHelpType() {
        return helpType;
    }

    public void setHelpType(HelpType helpType) {
        this.helpType = helpType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getDocumentUrls() {
        return documentUrls;
    }

    public void setDocumentUrls(List<String> documentUrls) {
        this.documentUrls = documentUrls;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public String getAssignedWorkerId() {
        return assignedWorkerId;
    }

    public void setAssignedWorkerId(String assignedWorkerId) {
        this.assignedWorkerId = assignedWorkerId;
    }

    private String requesterContact;
    private String requesterAddress;
    private String requesterEmail;
    private String requesterPhone;
    private String requesterProfilePhoto;

    public String getRequesterContact() {
        return requesterContact;
    }

    public void setRequesterContact(String requesterContact) {
        this.requesterContact = requesterContact;
    }

    public String getRequesterAddress() {
        return requesterAddress;
    }

    public void setRequesterAddress(String requesterAddress) {
        this.requesterAddress = requesterAddress;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getRequesterPhone() {
        return requesterPhone;
    }

    public void setRequesterPhone(String requesterPhone) {
        this.requesterPhone = requesterPhone;
    }

    public String getRequesterProfilePhoto() {
        return requesterProfilePhoto;
    }

    public void setRequesterProfilePhoto(String requesterProfilePhoto) {
        this.requesterProfilePhoto = requesterProfilePhoto;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public ServicePackageDTO getAppliedPackage() {
        return appliedPackage;
    }

    public void setAppliedPackage(ServicePackageDTO appliedPackage) {
        this.appliedPackage = appliedPackage;
    }

    public String getAppliedPackageStatus() {
        return appliedPackageStatus;
    }

    public void setAppliedPackageStatus(String appliedPackageStatus) {
        this.appliedPackageStatus = appliedPackageStatus;
    }

    public LocalDateTime getAppliedPackageAppliedAt() {
        return appliedPackageAppliedAt;
    }

    public void setAppliedPackageAppliedAt(LocalDateTime appliedPackageAppliedAt) {
        this.appliedPackageAppliedAt = appliedPackageAppliedAt;
    }

    public List<ServiceItemExecutionDTO> getAppliedPackageItemExecutions() {
        return appliedPackageItemExecutions;
    }

    public void setAppliedPackageItemExecutions(List<ServiceItemExecutionDTO> appliedPackageItemExecutions) {
        this.appliedPackageItemExecutions = appliedPackageItemExecutions;
    }
}
