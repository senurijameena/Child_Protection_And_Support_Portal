package com.example.childPortal.service;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.dto.CaseReportRequest;
import com.example.childPortal.dto.CaseResponse;
import com.example.childPortal.model.Case.CaseStatus;
import java.util.List;

public interface CaseService {
    CaseResponse reportCase(CaseReportRequest request, String reporterUserId);
    CaseDTO getCaseById(String caseId);
    List<CaseDTO> getCasesByReporter(String reporterUserId);
    List<CaseDTO> getAllCases();
    List<CaseDTO> getCasesByStatus(CaseStatus status);
    CaseDTO updateCaseStatus(String caseId, CaseStatus status, String updatedBy);
    CaseDTO assignCaseToOfficer(String caseId, String officerId, String assignedBy);
    CaseDTO assignCaseToSocialWorker(String caseId, String workerId, String assignedBy);
    boolean deleteCase(String caseId);
    CaseDTO updateCaseNotes(String caseId, String notes, String updatedBy);
}