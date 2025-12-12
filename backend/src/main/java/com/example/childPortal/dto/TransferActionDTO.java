package com.example.childPortal.dto; 

public class TransferActionDTO { 
  private String transferRequestId; 
  private String action;
  private String reason; 
  private String notes; 
  public TransferActionDTO() {} 
  
  public TransferActionDTO(String transferRequestId, String action, String reason) { 
    this.transferRequestId = transferRequestId; 
    this.action = action; 
    this.reason = reason; 
  } 
  
  public String getTransferRequestId() { 
    return transferRequestId; 
  } 
  public void setTransferRequestId(String transferRequestId) {
    this.transferRequestId = transferRequestId; 
  } 
  public String getAction() {
    return action;
  } 
  public void setAction(String action) {
    this.action = action; 
  } 
  public String getReason() { 
    return reason; 
  } 
  public void setReason(String reason) {
    this.reason = reason;
  } 
  public String getNotes() { 
    return notes;
  } 
  public void setNotes(String notes) { 
    this.notes = notes; 
  } 
}
