package com.example.childPortal.service.impl;

import com.example.childPortal.dto.CaseDTO; 
import com.example.childPortal.dto.HelpRequestDTO; 
import com.example.childPortal.dto.TrackResponse; 
import com.example.childPortal.service.CaseService; 
import com.example.childPortal.service.HelpRequestService; 
import com.example.childPortal.service.TrackingService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service;

@Service
public class TrackingServiceImpl implements TrackingService{
    @Autowired 
    private CaseService caseService; 

    @Autowired 
    private HelpRequestService helpRequestService; 
 
    @Override 
    public TrackResponse trackById(String trackingId) { 
        if (isCaseId(trackingId)) { 
            return trackCaseById(extractId(trackingId)); 
        } else if (isHelpRequestId(trackingId)) { 
            return trackHelpRequestById(extractId(trackingId)); 
        } else {
            TrackResponse caseResponse = trackCaseById(trackingId); 
            if (caseResponse.isFound()) { 
                return caseResponse; 
            } 
             
            TrackResponse helpResponse = trackHelpRequestById(trackingId); 
            if (helpResponse.isFound()) { 
                return helpResponse; 
            } 
             
            return new TrackResponse(trackingId); 
        } 
    } 
 
    @Override 
    public TrackResponse trackCaseById(String caseId) { 
        CaseDTO caseDTO = caseService.getCaseById(caseId); 
        if (caseDTO != null) { 
            String trackingId = "CS-" + caseId.substring(0, Math.min(4, caseId.length())).toUpperCase(); 
            return new TrackResponse(trackingId, caseDTO); 
        } 
        return new TrackResponse(caseId); 
    } 
 
    @Override 
    public TrackResponse trackHelpRequestById(String helpRequestId) { 
        HelpRequestDTO helpRequestDTO = helpRequestService.getHelpRequestById(helpRequestId); 
        if (helpRequestDTO != null) { 
            String trackingId = "RH-" + helpRequestId.substring(0, Math.min(4, helpRequestId.length())).toUpperCase(); 
            return new TrackResponse(trackingId, helpRequestDTO); 
        } 
        return new TrackResponse(helpRequestId); 
    } 
 
    private boolean isCaseId(String trackingId) { 
        return trackingId.toUpperCase().startsWith("CS-"); 
    } 
    
    private boolean isHelpRequestId(String trackingId) { 
        return trackingId.toUpperCase().startsWith("RH-"); 
    } 

    private String extractId(String trackingId) {
        if (trackingId.contains("-")) { 
            return trackingId.substring(trackingId.indexOf("-") + 1); 
        } 
        return trackingId; 
    } 
}
