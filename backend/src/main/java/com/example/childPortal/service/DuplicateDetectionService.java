package com.example.childPortal.service;

import com.example.childPortal.dto.DuplicateDetectionDTO;
import java.util.List;

public interface DuplicateDetectionService {

    List<DuplicateDetectionDTO> findDuplicateCases(String caseId);

    List<DuplicateDetectionDTO> findDuplicateHelpRequests(String helpRequestId);

    List<DuplicateDetectionDTO> searchSimilarCases(String location, String approximateAge, 
                                                   String gender, String identificationMarks);

    List<DuplicateDetectionDTO> searchSimilarHelpRequests(String location, String approximateAge, 
                                                         String gender, String helpType);

    List<DuplicateDetectionDTO> checkPotentialDuplicateCase(String location, String approximateAge, 
                                                            String gender, String identificationMarks,
                                                            java.time.LocalDateTime incidentDate);

    List<DuplicateDetectionDTO> checkPotentialDuplicateHelpRequest(String location, String approximateAge, 
                                                                  String gender, String helpType);
}

