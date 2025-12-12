package com.example.childPortal.model; 

import org.springframework.data.annotation.Id; 
import org.springframework.data.mongodb.core.mapping.Document; 
import java.time.LocalDateTime; 

@Document(collection = "case_responses") 
public class CaseResponse { 
    @Id 
    private String id;
    private String informationRequestId;
    private String caseId;
    private String userId;

    private String responseText;
    private LocalDateTime responseDate;

    private String documentUrl; 

    private boolean reviewed; 
    private String reviewedBy; 
    private LocalDateTime reviewDate; 
    private String reviewComments;
    
    public CaseResponse() { 
        this.responseDate = LocalDateTime.now(); 
        this.reviewed = false; 
    }

    public String getId() { 
        return id; 
    }
    public void setId(String id) { 
        this.id = id; 
    }
    public String getInformationRequestId() {
        return informationRequestId;
    }
    public void setInformationRequestId(String informationRequestId) {
        this.informationRequestId = informationRequestId;
    }
    public String getCaseId() { 
        return caseId; 
    }
    public void setCaseId(String caseId) { 
        this.caseId = caseId; 
    }
    public String getUserId() { 
        return userId; 
    }
    public void setUserId(String userId) { 
        this.userId = userId; 
    }
    public String getResponseText() { 
        return responseText; 
    }
    public void setResponseText(String responseText) { 
        this.responseText = responseText; 
    }
    public LocalDateTime getResponseDate() { 
        return responseDate; 
    }
    public void setResponseDate(LocalDateTime responseDate) { 
        this.responseDate = responseDate; 
    }
    public String getDocumentUrl() { 
        return documentUrl; 
    }
    public void setDocumentUrl(String documentUrl) { 
        this.documentUrl = documentUrl; 
    }
    public boolean isReviewed() { 
        return reviewed; 
    }
    public void setReviewed(boolean reviewed) { 
        this.reviewed = reviewed; 
    }
    public String getReviewedBy() { 
        return reviewedBy; 
    }
    public void setReviewedBy(String reviewedBy) { 
        this.reviewedBy = reviewedBy; 
    }
    public LocalDateTime getReviewDate() { 
        return reviewDate; 
    }
    public void setReviewDate(LocalDateTime reviewDate) { 
        this.reviewDate = reviewDate; 
    }
    public String getReviewComments() { 
        return reviewComments; 
    }
    public void setReviewComments(String reviewComments) { 
        this.reviewComments = reviewComments; 
    }
}
