package com.example.childPortal.dto;

import java.time.LocalDateTime; 
import java.util.List; 

public class InformationResponseDTO {
    private String informationRequestId;
    private String responseText; 
    private List<String> documentUrls;
    private boolean requestExtension;
    private String extensionReason;
    private LocalDateTime proposedNewDueDate; 

    public InformationResponseDTO() {}

    public String getInformationRequestId() { 
        return informationRequestId; 
    }
    public void setInformationRequestId(String informationRequestId) { 
        this.informationRequestId = informationRequestId; 
    }
    public String getResponseText() { 
        return responseText; 
    }
    public void setResponseText(String responseText) { 
        this.responseText = responseText; 
    }
    public List<String> getDocumentUrls() { 
        return documentUrls; 
    }
    public void setDocumentUrls(List<String> documentUrls) { 
        this.documentUrls = documentUrls; 
    }
    public boolean isRequestExtension() { 
        return requestExtension; 
    }
    public void setRequestExtension(boolean requestExtension) { 
        this.requestExtension = requestExtension; 
    }
    public String getExtensionReason() { 
        return extensionReason; 
    }
    public void setExtensionReason(String extensionReason) { 
        this.extensionReason = extensionReason; 
    }
    public LocalDateTime getProposedNewDueDate() { 
        return proposedNewDueDate; 
    }
    public void setProposedNewDueDate(LocalDateTime proposedNewDueDate) { 
        this.proposedNewDueDate = proposedNewDueDate; 
    }

}
