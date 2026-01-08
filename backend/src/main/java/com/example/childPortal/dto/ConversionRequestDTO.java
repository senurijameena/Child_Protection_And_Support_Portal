package com.example.childPortal.dto;

import java.util.List;

public class ConversionRequestDTO {
    private boolean linkToAccount;
    private boolean transferEvidence;
    private boolean maintainMessageHistory;
    private boolean revealIdentity;
    private boolean makeVisibleOnProfile;
    private String verificationCode;
    private String verificationMethod; 
    private List<String> additionalNotes;

    public boolean isLinkToAccount() { return linkToAccount; }
    public void setLinkToAccount(boolean linkToAccount) { this.linkToAccount = linkToAccount; }
    
    public boolean isTransferEvidence() { return transferEvidence; }
    public void setTransferEvidence(boolean transferEvidence) { this.transferEvidence = transferEvidence; }
    
    public boolean isMaintainMessageHistory() { return maintainMessageHistory; }
    public void setMaintainMessageHistory(boolean maintainMessageHistory) { this.maintainMessageHistory = maintainMessageHistory; }
    
    public boolean isRevealIdentity() { return revealIdentity; }
    public void setRevealIdentity(boolean revealIdentity) { this.revealIdentity = revealIdentity; }
    
    public boolean isMakeVisibleOnProfile() { return makeVisibleOnProfile; }
    public void setMakeVisibleOnProfile(boolean makeVisibleOnProfile) { this.makeVisibleOnProfile = makeVisibleOnProfile; }
    
    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
    
    public String getVerificationMethod() { return verificationMethod; }
    public void setVerificationMethod(String verificationMethod) { this.verificationMethod = verificationMethod; }
    
    public List<String> getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(List<String> additionalNotes) { this.additionalNotes = additionalNotes; }
}

