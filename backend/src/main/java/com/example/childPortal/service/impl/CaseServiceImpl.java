package com.example.childPortal.service.impl;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.dto.CaseReportRequest;
import com.example.childPortal.dto.CaseResponse;
import com.example.childPortal.model.Case;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.User;
import com.example.childPortal.repository.CaseRepository;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.CaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CaseServiceImpl implements CaseService {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public CaseResponse reportCase(CaseReportRequest request, String reporterUserId) {
        try {
            Case caseEntity = new Case();
            
            if (!request.isAnonymous() && reporterUserId != null) {
                caseEntity.setReporterUserId(reporterUserId);
            }
            caseEntity.setAnonymous(request.isAnonymous());
            caseEntity.setApproximateAge(request.getApproximateAge());
            caseEntity.setGender(request.getGender());
            caseEntity.setIdentificationMarks(request.getIdentificationMarks());
            caseEntity.setCaseType(request.getCaseType());
            caseEntity.setLocation(request.getLocation());
            caseEntity.setIncidentDate(request.getIncidentDate());
            caseEntity.setCaseDescription(request.getCaseDescription());
            caseEntity.setEvidenceUrls(request.getEvidenceUrls());
            caseEntity.setStatus(CaseStatus.REPORTED);

            Case savedCase = caseRepository.save(caseEntity);
            
            return new CaseResponse(savedCase.getId(), "Case reported successfully", true);
        } catch (Exception e) {
            return new CaseResponse(null, "Failed to report case: " + e.getMessage(), false);
        }
    }

    @Override
    public CaseDTO getCaseById(String caseId) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isPresent()) {
            return convertToDTO(caseOpt.get());
        }
        return null;
    }

    @Override
    public List<CaseDTO> getCasesByReporter(String reporterUserId) {
        List<Case> cases = caseRepository.findByReporterUserId(reporterUserId);
        return cases.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CaseDTO> getAllCases() {
        List<Case> cases = caseRepository.findAllByOrderByReportDateDesc();
        return cases.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CaseDTO> getCasesByStatus(CaseStatus status) {
        List<Case> cases = caseRepository.findByStatus(status);
        return cases.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public CaseDTO updateCaseStatus(String caseId, CaseStatus status) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isPresent()) {
            Case caseEntity = caseOpt.get();
            caseEntity.setStatus(status);
            caseEntity.setLastUpdated(LocalDateTime.now());
            Case updatedCase = caseRepository.save(caseEntity);
            return convertToDTO(updatedCase);
        }
        return null;
    }

    @Override
    public CaseDTO assignCaseToOfficer(String caseId, String officerId) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isPresent()) {
            Case caseEntity = caseOpt.get();
            caseEntity.setAssignedOfficerId(officerId);
            caseEntity.setStatus(CaseStatus.ASSIGNED_TO_OFFICER);
            caseEntity.setLastUpdated(LocalDateTime.now());
            Case updatedCase = caseRepository.save(caseEntity);
            return convertToDTO(updatedCase);
        }
        return null;
    }

    @Override
    public CaseDTO assignCaseToSocialWorker(String caseId, String workerId) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isPresent()) {
            Case caseEntity = caseOpt.get();
            caseEntity.setAssignedWorkerId(workerId);
            caseEntity.setStatus(CaseStatus.ASSIGNED_TO_SOCIAL_WORKER);
            caseEntity.setLastUpdated(LocalDateTime.now());
            Case updatedCase = caseRepository.save(caseEntity);
            return convertToDTO(updatedCase);
        }
        return null;
    }

    @Override
    public boolean deleteCase(String caseId) {
        if (caseRepository.existsById(caseId)) {
            caseRepository.deleteById(caseId);
            return true;
        }
        return false;
    }

    private CaseDTO convertToDTO(Case caseEntity) {
        CaseDTO dto = new CaseDTO();
        dto.setId(caseEntity.getId());
        dto.setReporterUserId(caseEntity.getReporterUserId());
        dto.setAnonymous(caseEntity.isAnonymous());
        dto.setApproximateAge(caseEntity.getApproximateAge());
        dto.setGender(caseEntity.getGender());
        dto.setIdentificationMarks(caseEntity.getIdentificationMarks());
        dto.setCaseType(caseEntity.getCaseType());
        dto.setLocation(caseEntity.getLocation());
        dto.setIncidentDate(caseEntity.getIncidentDate());
        dto.setCaseDescription(caseEntity.getCaseDescription());
        dto.setEvidenceUrls(caseEntity.getEvidenceUrls());
        dto.setStatus(caseEntity.getStatus());
        dto.setAssignedOfficerId(caseEntity.getAssignedOfficerId());
        dto.setAssignedWorkerId(caseEntity.getAssignedWorkerId());
        dto.setReportDate(caseEntity.getReportDate());
        dto.setLastUpdated(caseEntity.getLastUpdated());

        // Set reporter name if not anonymous
        if (!caseEntity.isAnonymous() && caseEntity.getReporterUserId() != null) {
            Optional<User> reporter = userRepository.findById(caseEntity.getReporterUserId());
            reporter.ifPresent(user -> dto.setReporterName(user.getFullName()));
        }

        // Set assigned officer name
        if (caseEntity.getAssignedOfficerId() != null) {
            Optional<User> officer = userRepository.findById(caseEntity.getAssignedOfficerId());
            officer.ifPresent(user -> dto.setAssignedOfficerName(user.getFullName()));
        }

        // Set assigned social worker name
        if (caseEntity.getAssignedWorkerId() != null) {
            Optional<User> worker = userRepository.findById(caseEntity.getAssignedWorkerId());
            worker.ifPresent(user -> dto.setAssignedWorkerName(user.getFullName()));
        }

        return dto;
    }
}