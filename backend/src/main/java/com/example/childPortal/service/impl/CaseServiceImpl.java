package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.repository.CaseRepository;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.CaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CaseServiceImpl implements CaseService {

    @Autowired private CaseRepository caseRepository;
    @Autowired private UserRepository userRepository;

    @Override
    public CaseResponse reportCase(CaseReportRequest request, String reporterUserId) {
        try {
            Case caseEntity = new Case();
            caseEntity.setReporterUserId(reporterUserId);
            caseEntity.setAnonymous(request.isAnonymous());
            caseEntity.setApproximateAge(request.getApproximateAge());
            caseEntity.setGender(request.getGender());
            caseEntity.setIdentificationMarks(request.getIdentificationMarks());
            caseEntity.setCaseType(request.getCaseType());
            caseEntity.setLocation(request.getLocation());
            caseEntity.setIncidentDate(request.getIncidentDate());
            caseEntity.setCaseDescription(request.getCaseDescription());
            caseEntity.setEvidenceUrls(request.getEvidenceUrls());
            
            if (!request.isAnonymous()) {
                userRepository.findById(reporterUserId)
                    .ifPresent(user -> caseEntity.setReporterName(user.getFullName()));
            }

            caseEntity = caseRepository.save(caseEntity);
            return new CaseResponse(caseEntity.getId(), "Case reported successfully", true);
        } catch (Exception e) {
            return new CaseResponse(null, "Failed to report case: " + e.getMessage(), false);
        }
    }

    @Override
    public CaseDTO getCaseById(String caseId) {
        return caseRepository.findById(caseId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public List<CaseDTO> getCasesByReporter(String reporterUserId) {
        return caseRepository.findByReporterUserId(reporterUserId).stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<CaseDTO> getAllCases() {
        return caseRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public List<CaseDTO> getCasesByStatus(Case.CaseStatus status) {
        return caseRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public CaseDTO updateCaseStatus(String caseId, Case.CaseStatus status, String updatedBy) {
        return caseRepository.findById(caseId)
                .map(caseEntity -> {
                    caseEntity.setStatus(status);
                    caseEntity.setLastUpdated(LocalDateTime.now());
                    if (status == Case.CaseStatus.RESOLVED || status == Case.CaseStatus.CLOSED) {
                        caseEntity.setResolutionDate(LocalDateTime.now());
                    }
                    caseRepository.save(caseEntity);
                    return convertToDTO(caseEntity);
                })
                .orElse(null);
    }

    @Override
    public CaseDTO assignCaseToOfficer(String caseId, String officerId, String assignedBy) {
        return caseRepository.findById(caseId)
                .map(caseEntity -> {
                    caseEntity.setAssignedOfficerId(officerId);
                    caseEntity.setStatus(Case.CaseStatus.ASSIGNED);
                    caseEntity.setLastUpdated(LocalDateTime.now());
                    caseRepository.save(caseEntity);
                    return convertToDTO(caseEntity);
                })
                .orElse(null);
    }

    @Override
    public CaseDTO assignCaseToSocialWorker(String caseId, String workerId, String assignedBy) {
        return caseRepository.findById(caseId)
                .map(caseEntity -> {
                    caseEntity.setAssignedWorkerId(workerId);
                    caseEntity.setStatus(Case.CaseStatus.ASSIGNED);
                    caseEntity.setLastUpdated(LocalDateTime.now());
                    caseRepository.save(caseEntity);
                    return convertToDTO(caseEntity);
                })
                .orElse(null);
    }

    @Override
    public boolean deleteCase(String caseId) {
        if (caseRepository.existsById(caseId)) {
            caseRepository.deleteById(caseId);
            return true;
        }
        return false;
    }

    @Override
    public CaseDTO updateCaseNotes(String caseId, String notes, String updatedBy) {
        return caseRepository.findById(caseId)
                .map(caseEntity -> {
                    caseEntity.setCaseNotes(notes);
                    caseEntity.setLastUpdated(LocalDateTime.now());
                    caseRepository.save(caseEntity);
                    return convertToDTO(caseEntity);
                })
                .orElse(null);
    }

    private CaseDTO convertToDTO(Case caseEntity) {
        CaseDTO dto = new CaseDTO();
        dto.setId(caseEntity.getId());
        dto.setTrackingId(caseEntity.getTrackingId());
        dto.setReporterUserId(caseEntity.getReporterUserId());
        dto.setAnonymous(caseEntity.isAnonymous());
        dto.setReporterName(caseEntity.getReporterName());
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
        dto.setPriority(caseEntity.getPriority());
        dto.setEmergency(caseEntity.isEmergency());
        return dto;
    }
}