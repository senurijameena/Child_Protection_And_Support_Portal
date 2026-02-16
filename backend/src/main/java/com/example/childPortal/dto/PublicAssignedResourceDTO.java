package com.example.childPortal.dto;

import java.time.LocalDateTime;

/**
 * Public-safe view of an assigned resource. Shown to the Public User on request details.
 * Only includes: resource name, contact phone, address, emergency support, instructions, assigned on, service type.
 * Does NOT include: internal notes, capacity, SW comments, license documents.
 */
public class PublicAssignedResourceDTO {
    private String resourceName;
    private String serviceType;       // Service item / checklist task name (e.g. Medical Help)
    private String contactPhone;
    private String address;           // resourceAddress or location
    private Boolean emergencySupport;
    private String instructions;      // specialInstructions
    private LocalDateTime assignedAt;

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Boolean getEmergencySupport() { return emergencySupport; }
    public void setEmergencySupport(Boolean emergencySupport) { this.emergencySupport = emergencySupport; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
}
