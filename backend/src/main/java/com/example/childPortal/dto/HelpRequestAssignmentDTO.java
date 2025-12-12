package com.example.childPortal.dto;

import com.example.childPortal.model.HelpRequestAssignment.AssignmentStatus;
import java.time.LocalDateTime;

public class HelpRequestAssignmentDTO {
 private String id;
 private String helpRequestId;
 private String socialWorkerId;
 private String socialWorkerName;
 private AssignmentStatus status;
 private LocalDateTime assignedDate;
 private LocalDateTime startedDate;
 private LocalDateTime completedDate;
 private String initialNotes;
 private String completionNotes;
 private String priority;
 private String helpRequestTitle;
 private String helpRequestType;
 private String requesterName;
 private String location;
 private boolean transferRequested;
 public HelpRequestAssignmentDTO() {}

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
    this.helpRequestId =helpRequestId; 
}
 public String getSocialWorkerId() { 
    return socialWorkerId; 
}
 public void setSocialWorkerId(String socialWorkerId) { 
    this.socialWorkerId =socialWorkerId; 
}
 public String getSocialWorkerName() { 
    return socialWorkerName; 
}
 public void setSocialWorkerName(String socialWorkerName) { 
    this.socialWorkerName = socialWorkerName; 
}
 public AssignmentStatus getStatus() { 
    return status; 
}
 public void setStatus(AssignmentStatus status) { 
    this.status = status; 
}
 public LocalDateTime getAssignedDate() { 
    return assignedDate; 
}
 public void setAssignedDate(LocalDateTime assignedDate) { 
    this.assignedDate =assignedDate; 
}
 public LocalDateTime getStartedDate() { 
    return startedDate; 
}
 public void setStartedDate(LocalDateTime startedDate) { 
    this.startedDate = startedDate;
}
 public LocalDateTime getCompletedDate() { 
    return completedDate; 
}
 public void setCompletedDate(LocalDateTime completedDate) { 
    this.completedDate = completedDate; 
}
 public String getInitialNotes() { 
    return initialNotes; 
}
 public void setInitialNotes(String initialNotes) { 
    this.initialNotes = initialNotes; 
}
 public String getCompletionNotes() { 
    return completionNotes; 
}
 public void setCompletionNotes(String completionNotes) { 
    this.completionNotes =completionNotes; 
}
 public String getPriority() { 
    return priority; 
}
 public void setPriority(String priority) { 
    this.priority = priority; 
}
 public String getHelpRequestTitle() { 
    return helpRequestTitle; 
}
 public void setHelpRequestTitle(String helpRequestTitle) { 
    this.helpRequestTitle =helpRequestTitle; 
}
 public String getHelpRequestType() { 
    return helpRequestType; 
}
 public void setHelpRequestType(String helpRequestType) { 
    this.helpRequestType =helpRequestType; 
}
 public String getRequesterName() { 
    return requesterName; 
}
 public void setRequesterName(String requesterName) { 
    this.requesterName = requesterName; 
}
 public String getLocation() { 
    return location; 
}
 public void setLocation(String location) { 
    this.location = location; 
}
 public boolean isTransferRequested() { 
    return transferRequested; 
}
 public void setTransferRequested(boolean transferRequested) { 
    this.transferRequested = transferRequested; }
}