package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "help_request_assignments")
public class HelpRequestAssignment {
 @Id
 private String id;
 private String helpRequestId;
 private String socialWorkerId;
 private AssignmentStatus status;
 private LocalDateTime assignedDate;
 private LocalDateTime startedDate;
 private LocalDateTime completedDate;
 private String initialNotes;
 private String completionNotes;
 private String priority; 
 private boolean transferRequested;
 private String transferReason;

 public enum AssignmentStatus {
 ASSIGNED,
 IN_PROGRESS,
 COMPLETED,
 TRANSFERRED,
 CANCELLED
 }

 public HelpRequestAssignment() {
 this.assignedDate = LocalDateTime.now();
 this.status = AssignmentStatus.ASSIGNED;
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
 public String getSocialWorkerId() { 
    return socialWorkerId; 
}
 public void setSocialWorkerId(String socialWorkerId) { 
    this.socialWorkerId =socialWorkerId; 
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
    this.completedDate =completedDate; 
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
 public boolean isTransferRequested() { 
    return transferRequested; 
}
 public void setTransferRequested(boolean transferRequested) { 
    this.transferRequested =transferRequested; 
}
 public String getTransferReason() { 
    return transferReason; 
}
 public void setTransferReason(String transferReason) { 
    this.transferReason =transferReason; 
}
}

