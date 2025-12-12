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
    CaseDTO updateCaseStatus(String caseId, CaseStatus status);
    CaseDTO assignCaseToOfficer(String caseId, String officerId);
    CaseDTO assignCaseToSocialWorker(String caseId, String workerId);
    boolean deleteCase(String caseId);
}