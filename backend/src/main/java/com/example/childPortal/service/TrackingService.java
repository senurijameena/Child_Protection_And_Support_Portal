package com.example.childPortal.service;

import com.example.childPortal.dto.TrackResponse;

public interface TrackingService {
    TrackResponse trackById(String trackingId); 
    TrackResponse trackCaseById(String caseId); 
    TrackResponse trackHelpRequestById(String helpRequestId);
}
