package com.example.childPortal.dto;

import com.example.childPortal.model.InformationRequest.Priority; 
import com.example.childPortal.model.InformationRequest.RequestStatus; 
import java.time.LocalDateTime; 
import java.util.List; 

public class InformationRequestDTO {
    private String id;
    private String caseId;
    private String helpRequestId;
    private String requestedByUserId;
    private String requestedFromUserId;
    private String requestedByName;
    private String requestedFromName;
    private String caseTitle;
    private String trackingId;

    private String title; 
    private String description; 
    private List<String> informationNeeded; 
    private Priority priority;
    private RequestStatus status;

    private LocalDateTime dateRequested; 
    private LocalDateTime dueDate;
    private LocalDateTime responseDate;

    private String userResponse;
    private List<String> responseDocuments;

    private boolean extensionRequested;
    private String extensionReason;
    private LocalDateTime newDueDate;

    private boolean isOverdue; 
    private boolean isUrgent; 

    public InformationRequestDTO() {}

    public String getId() { 
        return id; 
    }
    public void setId(String id) { 
        this.id = id; 
    }
    public String getCaseId() { 
        return caseId; 
    } 
    public void setCaseId(String caseId) { 
        this.caseId = caseId; 
    } 
    public String getHelpRequestId() { 
        return helpRequestId; 
    } 
    public void setHelpRequestId(String helpRequestId) { 
        this.helpRequestId = helpRequestId; 
    } 
    public String getRequestedByUserId() { 
        return requestedByUserId; 
    }
    public void setRequestedByUserId(String requestedByUserId) { 
        this.requestedByUserId = requestedByUserId; 
    }
    public String getRequestedFromUserId() { 
        return requestedFromUserId; 
    }
    public void setRequestedFromUserId(String requestedFromUserId) { 
        this.requestedFromUserId = requestedFromUserId; 
    }
    public String getRequestedByName() {
        return requestedByName;
    }
    public void setRequestedByName(String requestedByName) {
        this.requestedByName = requestedByName;
    }
    public String getRequestedFromName() {
        return requestedFromName;
    }
    public void setRequestedFromName(String requestedFromName) {
        this.requestedFromName = requestedFromName;
    }
    public String getCaseTitle() {
        return caseTitle;
    }
    public void setCaseTitle(String caseTitle) {
        this.caseTitle = caseTitle;
    }
    public String getTrackingId() {
        return trackingId;
    }
    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
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
    public List<String> getInformationNeeded() {
        return informationNeeded;
    }
    public void setInformationNeeded(List<String> informationNeeded) {
        this.informationNeeded = informationNeeded;
    }
    public Priority getPriority() {
        return priority;
    }
    public void setPriority(Priority priority) {
        this.priority = priority;
    }
    public RequestStatus getStatus() {
        return status;
    }
    public void setStatus(RequestStatus status) {
        this.status = status;
    }
    public LocalDateTime getDateRequested() {
        return dateRequested;
    }
    public void setDateRequested(LocalDateTime dateRequested) {
        this.dateRequested = dateRequested;
    }
    public LocalDateTime getDueDate() {
        return dueDate;
    }
    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
    public LocalDateTime getResponseDate() {
        return responseDate;
    }
    public void setResponseDate(LocalDateTime responseDate) {
        this.responseDate = responseDate;
    }
    public String getUserResponse() {
        return userResponse;
    }
    public void setUserResponse(String userResponse) {
        this.userResponse = userResponse;
    }
    public List<String> getResponseDocuments() {
        return responseDocuments;
    }
    public void setResponseDocuments(List<String> responseDocuments) {
        this.responseDocuments = responseDocuments;
    }
    public boolean isExtensionRequested() {
        return extensionRequested;
    }
    public void setExtensionRequested(boolean extensionRequested) {
        this.extensionRequested = extensionRequested;
    }
    public String getExtensionReason() {
        return extensionReason;
    }
    public void setExtensionReason(String extensionReason) {
        this.extensionReason = extensionReason;
    }
    public LocalDateTime getNewDueDate() {
        return newDueDate;
    }
    public void setNewDueDate(LocalDateTime newDueDate) {
        this.newDueDate = newDueDate;
    }
    public boolean isOverdue() {
        return isOverdue;
    }
    public void setOverdue(boolean isOverdue) {
        this.isOverdue = isOverdue;
    }
    public boolean isUrgent() {
        return isUrgent;
    }
    public void setUrgent(boolean isUrgent) {
        this.isUrgent = isUrgent;
    }
}
