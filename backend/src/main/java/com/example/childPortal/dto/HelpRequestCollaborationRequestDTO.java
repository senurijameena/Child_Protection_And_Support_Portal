package com.example.childPortal.dto;

public class HelpRequestCollaborationRequestDTO {
    private String collaboratorUserId;
    private String permission;
    private String reason;

    public String getCollaboratorUserId() {
        return collaboratorUserId;
    }

    public void setCollaboratorUserId(String collaboratorUserId) {
        this.collaboratorUserId = collaboratorUserId;
    }

    public String getPermission() {
        return permission;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
