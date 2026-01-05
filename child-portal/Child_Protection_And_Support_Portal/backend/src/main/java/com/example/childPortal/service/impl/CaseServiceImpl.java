package com.example.childPortal.service.impl;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.dto.CaseReportRequest;
import com.example.childPortal.dto.CaseResponse;
import com.example.childPortal.model.Case;
import com.example.childPortal.model.User;
import com.example.childPortal.model.Role;
import com.example.childPortal.model.Priority;
import com.example.childPortal.model.CaseType;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.repository.CaseRepository;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.CaseService;
import com.example.childPortal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CaseServiceImpl implements CaseService {

    @Autowired private CaseRepository caseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired(required = false) private NotificationService notificationService;

    @Override
    @Transactional
    public CaseResponse reportCase(CaseReportRequest request, String reporterUserId) {
        try {
            List<Case> similarCases = caseRepository.findByLocationAndApproximateAgeAndGenderAndIncidentDateBetween(
                request.getLocation(),
                request.getApproximateAge(),
                request.getGender(),
                request.getIncidentDate().minusHours(6), 
                request.getIncidentDate().plusHours(6)   
            );
        
            if (!similarCases.isEmpty()) {
                return new CaseResponse(
                    null, 
                    "A similar case was reported recently. Please check if this is a duplicate.", 
                    false
                );
            }

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

            if (request.getCaseType() != null) {
                switch (request.getCaseType()) {
                    case MISSING_CHILD:
                    case CHILD_TRAFFICKING:
                        caseEntity.setPriority(Priority.HIGH);
                        caseEntity.setEmergency(true);
                        break;
                    case CHILD_ABUSE:
                        caseEntity.setPriority(Priority.HIGH);
                        caseEntity.setEmergency(true);
                        break;
                    default:
                        caseEntity.setPriority(Priority.MEDIUM);
                        caseEntity.setEmergency(false);
                }
            }
            
            if (!request.isAnonymous()) {
                Optional<User> reporter = userRepository.findById(reporterUserId);
                if (reporter.isPresent()) {
                    caseEntity.setReporterName(reporter.get().getFullName());
                }
            } else {

                caseEntity.setReporterName("Anonymous Reporter");
            }

            // Generate sequential tracking ID based on anonymous status (before saving)
            // Use synchronized block to prevent race conditions when generating IDs
            String prefix = request.isAnonymous() ? "ANON C-" : "CASE-";
            String trackingId;
            
            synchronized (CaseServiceImpl.class) {
                // Query all cases to find the maximum tracking ID number
                List<Case> allCases = caseRepository.findAll();
                long maxNumber = 0;
                java.util.Set<String> existingIds = new java.util.HashSet<>();
                
                // Collect all existing tracking IDs - access field directly to avoid getter fallback
                for (Case existingCase : allCases) {
                    String existingTrackingId = null;
                    try {
                        // Access the private trackingId field directly to avoid getter's fallback logic
                        java.lang.reflect.Field field = Case.class.getDeclaredField("trackingId");
                        field.setAccessible(true);
                        existingTrackingId = (String) field.get(existingCase);
                    } catch (Exception e) {
                        // If reflection fails, use getter but filter out generated IDs
                        String tid = existingCase.getTrackingId();
                        // Only use if it matches our pattern (not a generated fallback)
                        if (tid != null && (tid.startsWith("CASE-") || tid.startsWith("ANON C-"))) {
                            existingTrackingId = tid;
                        }
                    }
                    
                    if (existingTrackingId != null && !existingTrackingId.isEmpty() && existingTrackingId.startsWith(prefix)) {
                        existingIds.add(existingTrackingId);
                        try {
                            // Extract number from tracking ID (e.g., "CASE-0001" -> 1, "ANON C-0001" -> 1)
                            String numberPart = existingTrackingId.substring(prefix.length()).trim();
                            if (!numberPart.isEmpty()) {
                                long number = Long.parseLong(numberPart);
                                if (number > maxNumber) {
                                    maxNumber = number;
                                }
                            }
                        } catch (NumberFormatException ex) {
                            // Skip invalid tracking IDs
                            continue;
                        }
                    }
                }
                
                // Generate next unique tracking ID
                long nextNumber = maxNumber + 1;
                trackingId = prefix + String.format("%04d", nextNumber);
                
                // Ensure uniqueness - if exists, increment until we find a free one
                int attempts = 0;
                while (existingIds.contains(trackingId) && attempts < 100) {
                    nextNumber++;
                    trackingId = prefix + String.format("%04d", nextNumber);
                    attempts++;
                }
                
                // Final check in database
                try {
                    if (caseRepository.existsByTrackingId(trackingId)) {
                        // If still exists, find the actual max and use next
                        long actualMax = 0;
                        for (Case c : allCases) {
                            try {
                                java.lang.reflect.Field field = Case.class.getDeclaredField("trackingId");
                                field.setAccessible(true);
                                String tid = (String) field.get(c);
                                if (tid != null && tid.startsWith(prefix)) {
                                    String numPart = tid.substring(prefix.length()).trim();
                                    if (!numPart.isEmpty()) {
                                        long num = Long.parseLong(numPart);
                                        if (num > actualMax) actualMax = num;
                                    }
                                }
                            } catch (Exception e) {
                                continue;
                            }
                        }
                        trackingId = prefix + String.format("%04d", actualMax + 1);
                    }
                } catch (Exception e) {
                    // If existsByTrackingId method fails, we'll rely on the in-memory check
                }
            }
            
            caseEntity.setTrackingId(trackingId);
            
            Case savedCase = caseRepository.save(caseEntity);
            
            // Send notification (app notification only for anonymous, email + app for non-anonymous)
            if (notificationService != null && reporterUserId != null) {
                notificationService.sendCaseCreatedNotification(reporterUserId, savedCase.getId(), request.isAnonymous());
            }
            
            return new CaseResponse(savedCase.getId(), "Case reported successfully", true);
        } catch (Exception e) {
            return new CaseResponse(null, "Failed to report case: " + e.getMessage(), false);
        }
    }

    @Override
    public CaseDTO getCaseById(String caseId) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) return null;
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return CaseDTO.createFilteredDTO(caseOpt.get(), userRole, currentUserId);
    }

    @Override
    public List<CaseDTO> getCasesByReporter(String reporterUserId) {
        List<Case> cases = caseRepository.findByReporterUserId(reporterUserId);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return cases.stream()
                .map(caseEntity -> CaseDTO.createFilteredDTO(caseEntity, userRole, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseDTO> getAllCases() {
        List<Case> allCases = caseRepository.findAll();

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return allCases.stream()
                .map(caseEntity -> CaseDTO.createFilteredDTO(caseEntity, userRole, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseDTO> getCasesByStatus(CaseStatus status) {
        List<Case> cases = caseRepository.findByStatus(status);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return cases.stream()
                .map(caseEntity -> CaseDTO.createFilteredDTO(caseEntity, userRole, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CaseDTO updateCaseStatus(String caseId, CaseStatus status, String updatedBy) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) return null;
        
        Case caseEntity = caseOpt.get();
        caseEntity.setStatus(status);
        caseEntity.setLastUpdated(LocalDateTime.now());
        
        if (status == CaseStatus.RESOLVED || status == CaseStatus.CLOSED) {
            caseEntity.setResolutionDate(LocalDateTime.now());
        }
        
        Case updatedCase = caseRepository.save(caseEntity);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return CaseDTO.createFilteredDTO(updatedCase, userRole, currentUserId);
    }

    @Override
    @Transactional
    public CaseDTO assignCaseToOfficer(String caseId, String officerId, String assignedBy) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) return null;
        
        Case caseEntity = caseOpt.get();
        caseEntity.setAssignedOfficerId(officerId);
        caseEntity.setStatus(CaseStatus.ASSIGNED);
        caseEntity.setLastUpdated(LocalDateTime.now());
        
        Case updatedCase = caseRepository.save(caseEntity);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return CaseDTO.createFilteredDTO(updatedCase, userRole, currentUserId);
    }

    @Override
    @Transactional
    public CaseDTO assignCaseToSocialWorker(String caseId, String workerId, String assignedBy) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) return null;
        
        Case caseEntity = caseOpt.get();
        caseEntity.setAssignedWorkerId(workerId);
        caseEntity.setStatus(CaseStatus.ASSIGNED);
        caseEntity.setLastUpdated(LocalDateTime.now());
        
        Case updatedCase = caseRepository.save(caseEntity);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return CaseDTO.createFilteredDTO(updatedCase, userRole, currentUserId);
    }

    @Override
    @Transactional
    public boolean deleteCase(String caseId) {
        if (caseRepository.existsById(caseId)) {
            caseRepository.deleteById(caseId);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public CaseDTO updateCaseNotes(String caseId, String notes, String updatedBy) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) return null;
        
        Case caseEntity = caseOpt.get();
        caseEntity.setCaseNotes(notes);
        caseEntity.setLastUpdated(LocalDateTime.now());
        
        Case updatedCase = caseRepository.save(caseEntity);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return CaseDTO.createFilteredDTO(updatedCase, userRole, currentUserId);
    }

    @Override
    public List<CaseDTO> getAllCasesWithFullDetails() {
        List<Case> allCases = caseRepository.findAll();

        return allCases.stream()
                .map(caseEntity -> {
                    CaseDTO dto = convertToFullDTO(caseEntity);
                    dto.setReporterName(caseEntity.getReporterName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseDTO> getPublicActiveCases() {
        List<Case> activeCases = caseRepository.findByStatus(CaseStatus.REPORTED);
        
        return activeCases.stream()
                .map(caseEntity -> {
                    CaseDTO dto = new CaseDTO();
                    dto.setId(caseEntity.getId());
                    dto.setTrackingId(caseEntity.getTrackingId());
                    dto.setCaseType(caseEntity.getCaseType());
                    dto.setLocation(caseEntity.getLocation());
                    dto.setIncidentDate(caseEntity.getIncidentDate());
                    dto.setStatus(caseEntity.getStatus());
                    dto.setReportDate(caseEntity.getReportDate());

                    if (caseEntity.isAnonymous()) {
                        dto.setReporterName("Anonymous");
                        dto.setAnonymous(true);
                    } else {
                        dto.setReporterName(caseEntity.getReporterName());
                        dto.setAnonymous(false);
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseDTO> getCasesForOfficer(String officerId) {
        List<Case> cases = caseRepository.findByAssignedOfficerId(officerId);
 
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return cases.stream()
                .map(caseEntity -> CaseDTO.createFilteredDTO(caseEntity, userRole, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseDTO> getCasesForWorker(String workerId) {
        List<Case> cases = caseRepository.findByAssignedWorkerId(workerId);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return cases.stream()
                .map(caseEntity -> CaseDTO.createFilteredDTO(caseEntity, userRole, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseDTO> getEmergencyCases() {
        List<Case> allCases = caseRepository.findAll();
        List<Case> emergencyCases = allCases.stream()
                .filter(Case::isEmergency)
                .collect(Collectors.toList());

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return emergencyCases.stream()
                .map(caseEntity -> CaseDTO.createFilteredDTO(caseEntity, userRole, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseDTO> getCasesByType(CaseType caseType) {
        List<Case> cases = caseRepository.findByCaseType(caseType);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return cases.stream()
                .map(caseEntity -> CaseDTO.createFilteredDTO(caseEntity, userRole, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CaseDTO updateCasePriority(String caseId, Priority priority, String updatedBy) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) return null;
        
        Case caseEntity = caseOpt.get();
        caseEntity.setPriority(priority);
        caseEntity.setLastUpdated(LocalDateTime.now());

        caseEntity.setEmergency(priority == Priority.HIGH);
        
        Case updatedCase = caseRepository.save(caseEntity);

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return CaseDTO.createFilteredDTO(updatedCase, userRole, currentUserId);
    }

    @Override
    public List<CaseDTO> searchCases(String keyword) {
        List<Case> allCases = caseRepository.findAll();
        List<Case> filteredCases = new ArrayList<>();
        
        String searchTerm = keyword.toLowerCase();
        
        for (Case caseEntity : allCases) {
            boolean matches = false;
            
            if (caseEntity.getTrackingId() != null && caseEntity.getTrackingId().toLowerCase().contains(searchTerm)) {
                matches = true;
            } else if (caseEntity.getLocation() != null && caseEntity.getLocation().toLowerCase().contains(searchTerm)) {
                matches = true;
            } else if (caseEntity.getCaseDescription() != null && caseEntity.getCaseDescription().toLowerCase().contains(searchTerm)) {
                matches = true;
            } else if (caseEntity.getReporterName() != null && caseEntity.getReporterName().toLowerCase().contains(searchTerm)) {
                matches = true;
            }
            
            if (matches) {
                filteredCases.add(caseEntity);
            }
        }

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
        
        return filteredCases.stream()
                .map(caseEntity -> CaseDTO.createFilteredDTO(caseEntity, userRole, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public long getCaseCountByStatus(CaseStatus status) {
        return caseRepository.findByStatus(status).size();
    }

    @Override
    public long getTotalCaseCount() {
        return caseRepository.count();
    }

    @Override
    public long getEmergencyCaseCount() {
        List<Case> allCases = caseRepository.findAll();
        return allCases.stream()
                .filter(Case::isEmergency)
                .count();
    }

    private CaseDTO convertToFullDTO(Case caseEntity) {
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