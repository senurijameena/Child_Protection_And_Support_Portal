package com.example.childPortal.dto;

import java.time.LocalDateTime;

import com.example.childPortal.model.Feedback.Category;
import com.example.childPortal.model.Feedback.FeedbackStatus;
import com.example.childPortal.model.Feedback.Privacy;

public class FeedbackDTO {
private String userType;  
private String formattedDate; 
private String ratingStars; 
private String caseTitle; 
private String assignedToName; 
private String assignedToRole; 
private String responseStatus; 

public String getUserType() { 
  return userType; 
}
public void setUserType(String userType) { 
  this.userType = userType; 
}
public String getFormattedDate() { 
  return formattedDate; 
}
public void setFormattedDate(String formattedDate) {
  this.formattedDate = formattedDate; 
}
public String getRatingStars() {
  return ratingStars; 
}
public void setRatingStars(String ratingStars) {
  this.ratingStars = ratingStars; 
}
public String getCaseTitle() { 
  return caseTitle;
}
 
public void setCaseTitle(String caseTitle) { 
  this.caseTitle = caseTitle; 
}
public String getAssignedToName() {
  return assignedToName;
}
public void setAssignedToName(String assignedToName) {
  this.assignedToName = assignedToName; 
}
public String getAssignedToRole() { 
  return assignedToRole; 
}
public void setAssignedToRole(String assignedToRole) {
  this.assignedToRole = assignedToRole; 
}
public LocalDateTime getResponseStatus() {
  return responseStatus; 
}
public void setResponseStatus(String responseStatus) { 
  this.responseStatus = responseStatus; 
}
public Object getFeedbackText() {
    throw new UnsupportedOperationException("Unimplemented method 'getFeedbackText'");
}
public String getMessage() {
    throw new UnsupportedOperationException("Unimplemented method 'getMessage'");
}
public String getServiceOfferId() {
    throw new UnsupportedOperationException("Unimplemented method 'getServiceOfferId'");
}
public String getHelpRequestId() {
    throw new UnsupportedOperationException("Unimplemented method 'getHelpRequestId'");
}
public Category getCategory() {
    throw new UnsupportedOperationException("Unimplemented method 'getCategory'");
}
public Privacy getPrivacy() {
    throw new UnsupportedOperationException("Unimplemented method 'getPrivacy'");
}
public boolean isAnonymous() {
    throw new UnsupportedOperationException("Unimplemented method 'isAnonymous'");
}
public String getUserName() {
    throw new UnsupportedOperationException("Unimplemented method 'getUserName'");
}
public void setPrivacy(Privacy privacy) {
    throw new UnsupportedOperationException("Unimplemented method 'setPrivacy'");
}
public void setAnonymous(boolean anonymous) {
    throw new UnsupportedOperationException("Unimplemented method 'setAnonymous'");
}
public void setAdminResponse(String adminResponse) {
    throw new UnsupportedOperationException("Unimplemented method 'setAdminResponse'");
}
public void setSubmissionDate(LocalDateTime submissionDate) {
    throw new UnsupportedOperationException("Unimplemented method 'setSubmissionDate'");
}
public void setLastUpdated(LocalDateTime lastUpdated) {
    throw new UnsupportedOperationException("Unimplemented method 'setLastUpdated'");
}
public void setTrackingId(String trackingId) {
    throw new UnsupportedOperationException("Unimplemented method 'setTrackingId'");
}
public void setStatus(FeedbackStatus status) {
    throw new UnsupportedOperationException("Unimplemented method 'setStatus'");
}
}
