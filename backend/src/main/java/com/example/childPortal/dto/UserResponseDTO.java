package com.example.childPortal.dto; 

import java.time.LocalDateTime; 
import java.util.List; 

public class UserResponseDTO { 
     private String responseId; 
     private String informationRequestId;
     private String caseId;
     private String trackingId;
     private String responseText;
     private List<String> documentUrls;
     private LocalDateTime responseDate; 
     private boolean reviewed;
     private String reviewComments;
     private LocalDateTime reviewDate; 

     public UserResponseDTO() {} 

        public UserResponseDTO(String responseId, String informationRequestId, String caseId, String trackingId, String responseText, List<String> documentUrls, LocalDateTime responseDate, boolean reviewed, String reviewComments, LocalDateTime reviewDate) { 
            this.responseId = responseId; 
            this.informationRequestId = informationRequestId; 
            this.caseId = caseId; 
            this.trackingId = trackingId; 
            this.responseText = responseText; 
            this.documentUrls = documentUrls; 
            this.responseDate = responseDate; 
            this.reviewed = reviewed; 
            this.reviewComments = reviewComments; 
            this.reviewDate = reviewDate; 
        }
        public String getResponseId() { 
            return responseId; 
        }
        public void setResponseId(String responseId) { 
            this.responseId = responseId; 
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
        public String getTrackingId() { 
            return trackingId; 
        }
        public void setTrackingId(String trackingId) { 
            this.trackingId = trackingId; 
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
        public LocalDateTime getResponseDate() { 
            return responseDate; 
        }
        public void setResponseDate(LocalDateTime responseDate) { 
            this.responseDate = responseDate; 
        }
        public boolean isReviewed() { 
            return reviewed; 
        }
        public void setReviewed(boolean reviewed) { 
            this.reviewed = reviewed; 
        }
        public String getReviewComments() { 
            return reviewComments; 
        }
        public void setReviewComments(String reviewComments) { 
            this.reviewComments = reviewComments; 
        }
        public LocalDateTime getReviewDate() { 
            return reviewDate; 
        }
        public void setReviewDate(LocalDateTime reviewDate) { 
            this.reviewDate = reviewDate; 
        }
        
} 
