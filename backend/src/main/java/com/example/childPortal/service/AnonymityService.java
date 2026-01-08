package com.example.childPortal.service;

import com.example.childPortal.dto.AnonymityStatsDTO;
import com.example.childPortal.dto.ConversionRequestDTO;

public interface AnonymityService {
    AnonymityStatsDTO getAnonymityStats(String userId);
    boolean convertCaseToAnonymous(String caseId, String userId);
    boolean convertCaseToRegistered(String caseId, String userId, ConversionRequestDTO request);
    boolean convertHelpRequestToAnonymous(String requestId, String userId);
    boolean convertHelpRequestToRegistered(String requestId, String userId, ConversionRequestDTO request);
}

