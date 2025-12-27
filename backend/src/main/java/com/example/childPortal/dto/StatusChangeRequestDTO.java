package com.example.childPortal.dto;
import com.example.childPortal.model.AvailabilityStatus;
public class StatusChangeRequestDTO {
private AvailabilityStatus newStatus;
private String note;
private Integer maxCapacity; 
private String expectedReturnTime; 
private boolean autoReturn;
  public AvailabilityStatus getNewStatus() { 
    return newStatus; 
  }
  public void setNewStatus(AvailabilityStatus newStatus) { 
    this.newStatus = newStat us;
  }
  public String getNote() { 
    return note; 
  }
  public void setNote(String note) { 
    this.note = note; 
  }
  public Integer getMaxCapacity() {
    return maxCapacity;
  }
  public void setMaxCapacity(Integer maxCapacity) { 
    this.maxCapacity = maxCapacity; 
  }
  public String getExpectedReturnTime() {
    return expectedReturnTime; 
  } 
  public void setExpectedReturnTime(String expectedReturnTime) {
    this.expectedReturnTime = expectedReturnTime; 
  }
  public boolean isAutoReturn() { 
    return autoReturn; 
  }
  public void setAutoReturn(boolean autoReturn) { 
    this.autoReturn = autoReturn;
  }
}
