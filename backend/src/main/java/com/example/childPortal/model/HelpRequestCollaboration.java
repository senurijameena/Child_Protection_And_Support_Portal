package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "help_request_collaborations")
public class HelpRequestCollaboration {
    @Id
    private String id;
    private String helpRequestId;
    private String ownerUserId;
    private String collaboratorUserId;
    private Permission permission;
    private Status status;
    private String reason;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime removedAt;
    private String removedByUserId;

    public enum Permission {
        FULL_ACCESS,
        VIEW_ONLY,
        SERVICE_ONLY
    }

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED,
        REMOVED
    }

    public HelpRequestCollaboration() {
        this.status = Status.PENDING;
        this.permission = Permission.VIEW_ONLY;
        this.requestedAt = LocalDateTime.now();
    }

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

    public String getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(String ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public String getCollaboratorUserId() {
        return collaboratorUserId;
    }

    public void setCollaboratorUserId(String collaboratorUserId) {
        this.collaboratorUserId = collaboratorUserId;
    }

    public Permission getPermission() {
        return permission;
    }

    public void setPermission(Permission permission) {
        this.permission = permission;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
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

    public LocalDateTime getRemovedAt() {
        return removedAt;
    }

    public void setRemovedAt(LocalDateTime removedAt) {
        this.removedAt = removedAt;
    }

    public String getRemovedByUserId() {
        return removedByUserId;
    }

    public void setRemovedByUserId(String removedByUserId) {
        this.removedByUserId = removedByUserId;
    }
}
