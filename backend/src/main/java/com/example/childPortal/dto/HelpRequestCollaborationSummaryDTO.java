package com.example.childPortal.dto;

import java.util.ArrayList;
import java.util.List;

public class HelpRequestCollaborationSummaryDTO {
    private String helpRequestId;
    private String ownerUserId;
    private String ownerName;
    private String ownerProfilePhoto;
    private int activeCollaboratorCount;
    private List<HelpRequestCollaboratorDTO> collaborators = new ArrayList<>();
    private List<HelpRequestCollaboratorDTO> pendingRequests = new ArrayList<>();

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

    public int getActiveCollaboratorCount() {
        return activeCollaboratorCount;
    }

    public void setActiveCollaboratorCount(int activeCollaboratorCount) {
        this.activeCollaboratorCount = activeCollaboratorCount;
    }

    public List<HelpRequestCollaboratorDTO> getCollaborators() {
        return collaborators;
    }

    public void setCollaborators(List<HelpRequestCollaboratorDTO> collaborators) {
        this.collaborators = collaborators;
    }

    public List<HelpRequestCollaboratorDTO> getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(List<HelpRequestCollaboratorDTO> pendingRequests) {
        this.pendingRequests = pendingRequests;
    }
}
