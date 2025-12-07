package com.example.childPortal.dto;

import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.Priority;
import com.example.childPortal.model.HelpRequest.RequestStatus; 
import java.time.LocalDateTime;
import java.util.List;

public class HelpRequestApproveDTO {

private String id;
private String trackingId;
private HelpType helpType;
private String requesterName; 
private boolean anonymous;

private String approximateAge; 
private String gender;
private String location;
private String description;
private List<String> documentUrls;

private Priority priority;
private boolean emergency;
private RequestStatus status; 
private LocalDateTime requestDate;

private boolean basicNeeds; 
private boolean urgentSituation; 
private boolean vulnerableChild;

public HelpRequestApproveDTO() {}

public String getId() { return id; }
public void setId(String id) { this.id = id; }

public String getTrackingId() { return trackingId; }
public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

public HelpType getHelpType() { return helpType; }
public void setHelpType(HelpType helpType) { this.helpType = helpType; }

public String getRequesterName() { return requesterName; }
public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

public boolean isAnonymous() { return anonymous; }
public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }

public String getApproximateAge() { return approximateAge; }
public void setApproximateAge(String approximateAge) { this.approximateAge = approximateAge; }

public String getGender() { return gender; }
public void setGender(String gender) { this.gender = gender; }

public String getLocation() { return location; }
public void setLocation(String location) { this.location = location; }

public String getDescription() { return description; }
public void setDescription(String description) { this.description = description; }

public List<String> getDocumentUrls() { return documentUrls; }
public void setDocumentUrls(List<String> documentUrls) { this.documentUrls = documentUrls; }

public Priority getPriority() { return priority; }
public void setPriority(Priority priority) { this.priority = priority; }

public boolean isEmergency() { return emergency; }
public void setEmergency(boolean emergency) { this.emergency = emergency; }

public RequestStatus getStatus() { return status; }
public void setStatus(RequestStatus status) { this.status = status; }

public LocalDateTime getRequestDate() { return requestDate; }
public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }

public boolean isBasicNeeds() { return basicNeeds; }
public void setBasicNeeds(boolean basicNeeds) { this.basicNeeds = basicNeeds; }

public boolean isUrgentSituation() { return urgentSituation; }
public void setUrgentSituation(boolean urgentSituation) { this.urgentSituation = urgentSituation; }

public boolean isVulnerableChild() { return vulnerableChild; }
public void setVulnerableChild(boolean vulnerableChild) { this.vulnerableChild = vulnerableChild; }
}


















