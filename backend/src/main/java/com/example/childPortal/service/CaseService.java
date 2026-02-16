package com.example.childPortal.service;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.dto.CaseReportRequest;
import com.example.childPortal.dto.CaseResponse;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.CaseType;
import com.example.childPortal.model.Priority;
import java.util.List;

public interface CaseService {
    CaseResponse reportCase(CaseReportRequest request, String reporterUserId);

    CaseDTO getCaseById(String caseId);

    List<CaseDTO> getCasesByReporter(String reporterUserId);

    List<CaseDTO> getAllCases();

    List<CaseDTO> getCasesByStatus(CaseStatus status);

    CaseDTO updateCaseStatus(String caseId, CaseStatus status, String updatedBy);

    CaseDTO assignCaseToOfficer(String caseId, String officerId, String assignedBy);

    CaseDTO assignCaseToStation(String caseId, String stationId, String assignedBy);

    CaseDTO assignCaseToSocialWorker(String caseId, String workerId, String assignedBy);

    boolean deleteCase(String caseId);

    CaseDTO updateCaseNotes(String caseId, String notes, String updatedBy);

    List<CaseDTO> getAllCasesWithFullDetails();

    List<CaseDTO> getPublicActiveCases();

    List<CaseDTO> getCasesForOfficer(String officerId);

    List<CaseDTO> getCasesForStation(String stationId);

    List<CaseDTO> getCasesForWorker(String workerId);

    List<CaseDTO> getEmergencyCases();

    List<CaseDTO> getCasesByType(CaseType caseType);

    CaseDTO updateCasePriority(String caseId, Priority priority, String updatedBy);

    List<CaseDTO> searchCases(String keyword);

    long getCaseCountByStatus(CaseStatus status);

    long getTotalCaseCount();

    long getEmergencyCaseCount();

    CaseDTO addEvidenceToCase(String caseId, String evidenceUrl);

    CaseDTO declineCaseByOfficer(String caseId, String officerId, String reason);
}