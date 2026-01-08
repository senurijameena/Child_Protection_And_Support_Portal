package com.example.childPortal.dto;

import com.example.childPortal.model.CaseTimelineEvent.EventType;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import java.time.LocalDateTime;

public class HelpRequestTimelineDTO {
    private String id;
    private String helpRequestId;
    private EventType eventType;
    private String title;
    private String description;
    private String details;
    private String performedByUserId;
    private String performedByRole;
    private String performedByName;
    private String targetUserId;
    private String targetRole;
    private String targetName;
    private RequestStatus previousStatus;
    private RequestStatus newStatus;
    private String statusChangeReason;
    private LocalDateTime eventTime;
    private String ipAddress;
    private String userAgent;
    private String documentUrl;
    private String serviceOfferId;
    private String transferRequestId;
    private String metadata;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getHelpRequestId() {
        return helpRequestId;
    }

    public void setHelpRequestId(String helpRequestId) {
        this.helpRequestId = helpRequestId;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getPerformedByUserId() {
        return performedByUserId;
    }

    public void setPerformedByUserId(String performedByUserId) {
        this.performedByUserId = performedByUserId;
    }

    public String getPerformedByRole() {
        return performedByRole;
    }

    public void setPerformedByRole(String performedByRole) {
        this.performedByRole = performedByRole;
    }

    public String getPerformedByName() {
        return performedByName;
    }

    public void setPerformedByName(String performedByName) {
        this.performedByName = performedByName;
    }

    public String getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(String targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }

    public RequestStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(RequestStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public RequestStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(RequestStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getStatusChangeReason() {
        return statusChangeReason;
    }

    public void setStatusChangeReason(String statusChangeReason) {
        this.statusChangeReason = statusChangeReason;
    }

    public LocalDateTime getEventTime() {
        return eventTime;
    }

    public void setEventTime(LocalDateTime eventTime) {
        this.eventTime = eventTime;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getServiceOfferId() {
        return serviceOfferId;
    }

    public void setServiceOfferId(String serviceOfferId) {
        this.serviceOfferId = serviceOfferId;
    }

    public String getTransferRequestId() {
        return transferRequestId;
    }

    public void setTransferRequestId(String transferRequestId) {
        this.transferRequestId = transferRequestId;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}

