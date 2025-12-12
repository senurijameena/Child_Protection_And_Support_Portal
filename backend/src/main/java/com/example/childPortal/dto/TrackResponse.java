package com.example.childPortal.dto; 

import com.example.childPortal.model.Case.CaseStatus; 
import com.example.childPortal.model.HelpRequest.RequestStatus; 
import java.time.LocalDateTime; 

public class TrackResponse { 
    private String trackingId; 
    private String type;
    private String status; 
    private String title; 
    private String description; 
    private LocalDateTime reportDate; 
    private LocalDateTime lastUpdated; 
    private String assignedTo; 
    private String assignedToName; 
    private String location; 
    private boolean found; 
    private String message; 

    public TrackResponse(String trackingId, CaseDTO caseDTO) { 
        this.trackingId = trackingId; 
        this.type = "CASE"; 
        this.status = caseDTO.getStatus().toString(); 
        this.title = "Case: " + caseDTO.getCaseType(); 
        this.description = caseDTO.getCaseDescription(); 
        this.reportDate = caseDTO.getReportDate(); 
        this.lastUpdated = caseDTO.getLastUpdated(); 
        this.assignedTo = caseDTO.getAssignedOfficerId(); 
        this.assignedToName = caseDTO.getAssignedOfficerName(); 
        this.location = caseDTO.getLocation(); 
        this.found = true; 
        this.message = "Case found successfully"; 
    }

    public TrackResponse(String trackingId, HelpRequestDTO helpRequestDTO) { 
        this.trackingId = trackingId; 
        this.type = "HELP_REQUEST"; 
        this.status = helpRequestDTO.getStatus().toString(); 
        this.title = "Help Request: " + helpRequestDTO.getHelpType(); 
        this.description = helpRequestDTO.getDescription(); 
        this.reportDate = helpRequestDTO.getRequestDate(); 
        this.lastUpdated = helpRequestDTO.getLastUpdated(); 
        this.assignedTo = helpRequestDTO.getAssignedWorkerId(); 
        this.assignedToName = helpRequestDTO.getAssignedWorkerName(); 
        this.location = helpRequestDTO.getLocation(); 
        this.found = true; 
        this.message = "Help request found successfully"; 
    }
    
    public TrackResponse(String trackingId) { 
        this.trackingId = trackingId; 
        this.found = false; 
        this.message = "No case or help request found with ID: " + trackingId; 
    }

    public String getTrackingId() { 
        return trackingId; 
    }
    public String getType() { 
        return type; 
    }
    public String getStatus() { 
        return status; 
    }
    public String getTitle() { 
        return title; 
    }
    public String getDescription() { 
        return description; 
    }
    public LocalDateTime getReportDate() { 
        return reportDate; 
    }
    public LocalDateTime getLastUpdated() { 
        return lastUpdated; 
    }
    public String getAssignedTo() { 
        return assignedTo; 
    }
    public String getAssignedToName() { 
        return assignedToName; 
    }
    public String getLocation() { 
        return location; 
    }
    public boolean isFound() { 
        return found; 
    }
    public String getMessage() { 
        return message; 
    }

    public void setFound(boolean b) {
        throw new UnsupportedOperationException("Unimplemented method 'setFound'");
    }

    public void setMessage(String string) {
        throw new UnsupportedOperationException("Unimplemented method 'setMessage'");
    }
}